import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  productLogger,
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";
import {
  calculateTTC,
  getPriceBreakdown,
} from "@/lib/tva-utils";

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  comparePrice: z.number().positive().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  tva: z.enum(["TVA_20", "TVA_10", "TVA_5_5", "TVA_0"]).optional(),
  priority: z.number().int().optional(),
  categoryId: z.string().nullable().optional(),
});

// GET Détails du produit avec calculs TVA
export const GET = withApiLogger(
  async (_req: NextRequest, context: unknown) => {
    try {
      const { id } = await (context as { params: Promise<{ id: string }> }).params;

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (!product) {
        return loggedErrorResponse("Produit non trouvé", 404);
      }

      const priceHT = product.price.toNumber();
      const priceBreakdown = getPriceBreakdown(priceHT, product.tva);
      
      const comparePriceHT = product.comparePrice?.toNumber();
      const comparePriceTTC = comparePriceHT 
        ? calculateTTC(comparePriceHT, product.tva)
        : null;

      return loggedSuccessResponse({
        product: {
          ...product,
          price: priceHT,
          comparePrice: comparePriceHT ?? null,
          priceBreakdown: {
            priceHT: priceBreakdown.priceHT,
            priceTTC: priceBreakdown.priceTTC,
            tvaAmount: priceBreakdown.tvaAmount,
            tvaRate: priceBreakdown.tvaRate,
            tvaLabel: priceBreakdown.tvaLabel,
          },
          comparePriceTTC,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      return loggedErrorResponse(
        `Erreur récupération produit: ${message}`,
        500
      );
    }
  }
);

// PATCH  Mise à jour Admin 
export const PATCH = withApiLogger(
  async (req: NextRequest, context: unknown) => {
    try {
      const session = await getServerSession(authOptions);
      if (!session || session.user?.role !== "ADMIN") {
        return loggedErrorResponse("Non autorisé", 403);
      }

      const { id } = await (context as { params: Promise<{ id: string }> }).params;

      const body = await req.json();
      const validatedData = updateProductSchema.parse(body);

      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        return loggedErrorResponse("Produit non trouvé", 404);
      }

      if (validatedData.slug && validatedData.slug !== existingProduct.slug) {
        const slugExists = await prisma.product.findUnique({
          where: { slug: validatedData.slug },
        });
        if (slugExists) {
          return loggedErrorResponse("Ce slug est déjà utilisé", 400);
        }
      }

      if (validatedData.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: validatedData.categoryId },
        });
        if (!category) {
          return loggedErrorResponse("Catégorie non trouvée", 404);
        }
      }

      const product = await prisma.product.update({
        where: { id },
        data: validatedData,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      });

      productLogger.info(`Produit ${id} mis à jour`);

      const priceHT = product.price.toNumber();
      const priceBreakdown = getPriceBreakdown(priceHT, product.tva);
      const comparePriceHT = product.comparePrice?.toNumber();
      const comparePriceTTC = comparePriceHT ? calculateTTC(comparePriceHT, product.tva) : null;

      return loggedSuccessResponse(
        {
          product: {
            ...product,
            price: priceHT,
            comparePrice: comparePriceHT ?? null,
            priceBreakdown,
            comparePriceTTC,
          },
        },
        "Produit mis à jour avec succès"
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      return loggedErrorResponse(`Erreur mise à jour: ${message}`, 500);
    }
  }
);

// DELETE Suppression Admin
export const DELETE = withApiLogger(
  async (_req: NextRequest, context: unknown) => {
    try {
      const session = await getServerSession(authOptions);
      if (!session || session.user?.role !== "ADMIN") {
        return loggedErrorResponse("Non autorisé", 403);
      }

      const { id } = await (context as { params: Promise<{ id: string }> }).params;

      const product = await prisma.product.findUnique({
        where: { id },
        include: { orderItems: true },
      });

      if (!product) {
        return loggedErrorResponse("Produit non trouvé", 404);
      }

      if (product.orderItems.length > 0) {
        return loggedErrorResponse(
          "Impossible de supprimer un produit ayant des commandes liées",
          400
        );
      }

      await prisma.product.delete({ where: { id } });
      productLogger.info(`Produit ${id} supprimé`);

      return loggedSuccessResponse(
        { message: "Produit supprimé avec succès" },
        "Produit supprimé"
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      return loggedErrorResponse(`Erreur suppression: ${message}`, 500);
    }
  }
);