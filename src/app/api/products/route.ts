import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  productLogger,
  LogMessages,
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";
import { ZodError } from "zod";
import { getPriceBreakdown } from "@/lib/tva-utils";

export const dynamic = 'force-dynamic';

export const GET = withApiLogger(async (_req: NextRequest) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        stock: true,
        images: true,
        createdAt: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const serializedProducts = products.map((product) => {
      const priceHT = typeof product.price === 'object' ? Number(product.price) : product.price;
      const breakdown = getPriceBreakdown(priceHT, "TVA_20");

      return {
        ...product,
        price: priceHT,
        tva: "TVA_20",
        priceTTC: breakdown.priceTTC,
        priceBreakdown: breakdown,
        image: product.images?.[0] || null,
      };
    });

    productLogger.info(`${serializedProducts.length} produits récupérés`);
    return loggedSuccessResponse(
      { products: serializedProducts },
      `Liste des produits récupérée`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur récupération produits: ${message}`, 500);
  }
});

export const POST = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        price: body.price,
        stock: body.stock || 0,
        images: body.images || [],
        categoryId: body.categoryId,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    const priceHT = Number(product.price);
    const breakdown = getPriceBreakdown(priceHT, "TVA_20");

    const serializedProduct = {
      ...product,
      price: priceHT,
      tva: "TVA_20",
      priceTTC: breakdown.priceTTC,
      priceBreakdown: breakdown,
      image: product.images[0] || null,
    };

    productLogger.info(LogMessages.product.produitCree(product.id, product.name));

    return loggedSuccessResponse(
      { product: serializedProduct },
      LogMessages.product.produitCree(product.id, product.name),
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return loggedErrorResponse(error.issues[0].message, 400);
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur création produit: ${message}`, 500);
  }
});