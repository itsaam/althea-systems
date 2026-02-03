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
import { getPriceBreakdown } from "@/lib/tva-utils";

export const dynamic = 'force-dynamic';

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().nullable().optional(),
});

export const GET = withApiLogger(async (_req: NextRequest, context: unknown) => {
  try {
    const { id } = await (context as { params: Promise<{ id: string }> }).params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        stock: true,
        images: true,
        categoryId: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!product) {
      return loggedErrorResponse("Produit non trouvé", 404);
    }

    const priceHT = typeof product.price === 'object' ? Number(product.price) : product.price;
    const breakdown = getPriceBreakdown(priceHT, "TVA_20");

    return loggedSuccessResponse({
      product: {
        ...product,
        price: priceHT,
        tva: "TVA_20",
        priceTTC: breakdown.priceTTC,
        priceBreakdown: breakdown,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur récupération produit: ${message}`, 500);
  }
});

export const PATCH = withApiLogger(async (req: NextRequest, context: unknown) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé", 403);
    }

    const { id } = await (context as { params: Promise<{ id: string }> }).params;
    const body = await req.json();
    
    // Suppression des variables inutilisées pour ESLint
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tva, priceTTC, priceBreakdown, ...validPrismaData } = body;
    const validatedData = updateProductSchema.parse(validPrismaData);

    const product = await prisma.product.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        stock: true,
        images: true,
        categoryId: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    const priceHT = Number(product.price);
    const breakdown = getPriceBreakdown(priceHT, "TVA_20");

    productLogger.info(`Produit ${id} mis à jour`);

    return loggedSuccessResponse(
      {
        product: {
          ...product,
          price: priceHT,
          tva: "TVA_20",
          priceTTC: breakdown.priceTTC,
          priceBreakdown: breakdown,
        },
      },
      "Produit mis à jour avec succès"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur mise à jour: ${message}`, 500);
  }
});

export const DELETE = withApiLogger(async (_req: NextRequest, context: unknown) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé", 403);
    }

    const { id } = await (context as { params: Promise<{ id: string }> }).params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true }
        }
      }
    });

    if (!product) {
      return loggedErrorResponse("Produit non trouvé", 404);
    }

    if (product._count.orderItems > 0) {
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
});