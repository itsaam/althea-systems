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

// GET 
export const GET = withApiLogger(
  async (_req: NextRequest, context: { params: { id: string } }) => {
    try {
      const { id } = context.params;

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

      return loggedSuccessResponse({
        product: {
          ...product,
          price: product.price.toNumber(),
          comparePrice: product.comparePrice?.toNumber() ?? null,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";
      return loggedErrorResponse(
        `Erreur récupération produit: ${message}`,
        500
      );
    }
  }
);

// PATCH Admin 

export const PATCH = withApiLogger(
  async (req: NextRequest, context: { params: { id: string } }) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session || session.user?.role !== "ADMIN") {
        return loggedErrorResponse("Non autorisé", 403);
      }

      const { id } = context.params;
      const body = await req.json();
      const validatedData = updateProductSchema.parse(body);

      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        return loggedErrorResponse("Produit non trouvé", 404);
      }

      if (
        validatedData.slug &&
        validatedData.slug !== existingProduct.slug
      ) {
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
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      productLogger.info(`Produit ${id} mis à jour`);

      return loggedSuccessResponse(
        {
          product: {
            ...product,
            price: product.price.toNumber(),
            comparePrice: product.comparePrice?.toNumber() ?? null,
          },
        },
        "Produit mis à jour avec succès"
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return loggedErrorResponse(
          `Données invalides: ${error.issues
            .map((i) => i.message)
            .join(", ")}`,
          400
        );
      }

      const message =
        error instanceof Error ? error.message : "Erreur inconnue";
      return loggedErrorResponse(
        `Erreur mise à jour produit: ${message}`,
        500
      );
    }
  }
);

// DELETE Admin

export const DELETE = withApiLogger(
  async (_req: NextRequest, context: { params: { id: string } }) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session || session.user?.role !== "ADMIN") {
        return loggedErrorResponse("Non autorisé", 403);
      }

      const { id } = context.params;

      const product = await prisma.product.findUnique({
        where: { id },
        include: { orderItems: true },
      });

      if (!product) {
        return loggedErrorResponse("Produit non trouvé", 404);
      }

      if (product.orderItems.length > 0) {
        return loggedErrorResponse(
          "Impossible de supprimer un produit ayant des commandes",
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
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";
      return loggedErrorResponse(
        `Erreur suppression produit: ${message}`,
        500
      );
    }
  }
);
