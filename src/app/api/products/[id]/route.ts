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
import { getPriceBreakdown, calculateTTC } from "@/lib/tva-utils";

export const dynamic = "force-dynamic";

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().nullable().optional(),
  featured: z.boolean().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withApiLogger(async (_req: NextRequest, context: unknown) => {
  try {
    const { id } = await (context as RouteContext).params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!product) return loggedErrorResponse("Produit non trouvé", 404);

    const priceHT = product.price.toNumber();
    const breakdown = getPriceBreakdown(priceHT, product.tva);
    const comparePriceHT = product.comparePrice?.toNumber();
    const comparePriceTTC = comparePriceHT
      ? calculateTTC(comparePriceHT, product.tva)
      : null;

    return loggedSuccessResponse({
      product: {
        ...product,
        price: priceHT,
        comparePrice: comparePriceHT ?? null,
        priceTTC: breakdown.priceTTC,
        priceBreakdown: breakdown,
        comparePriceTTC,
        image: product.images?.[0] || null,
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

    const { id } = await (context as RouteContext).params;

    const body = await req.json() as Record<string, unknown>;
    const {
      tva: _tva,
      priceTTC: _priceTTC,
      priceBreakdown: _priceBreakdown,
      comparePriceTTC: _comparePriceTTC,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...rest
    } = body;

    const validatedData = updateProductSchema.parse(rest);

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) return loggedErrorResponse("Produit non trouvé", 404);

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
    const comparePriceTTC = comparePriceHT
      ? calculateTTC(comparePriceHT, product.tva)
      : null;

    return loggedSuccessResponse(
      {
        product: {
          ...product,
          price: priceHT,
          comparePrice: comparePriceHT ?? null,
          priceTTC: priceBreakdown.priceTTC,
          priceBreakdown,
          comparePriceTTC,
          image: product.images?.[0] || null,
        },
      },
      "Produit mis à jour avec succès"
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(
        `Données invalides: ${error.issues.map((i) => i.message).join(", ")}`,
        400
      );
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur mise à jour produit: ${message}`, 500);
  }
});

export const DELETE = withApiLogger(async (_req: NextRequest, context: unknown) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé", 403);
    }

    const { id } = await (context as RouteContext).params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!product) return loggedErrorResponse("Produit non trouvé", 404);

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
    return loggedErrorResponse(`Erreur suppression produit: ${message}`, 500);
  }
});