import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
  apiLogger,
} from "@/lib/logger/exports";
import { getPriceBreakdown } from "@/lib/tva-utils";

export const dynamic = "force-dynamic";

const STOCK_MIN_THRESHOLD = 5;

export const GET = withApiLogger(async (_req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé", 403);
    }

    const [outOfStock, lowStock] = await Promise.all([
      prisma.product.findMany({
        where: { stock: 0, status: "PUBLISHED" },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          comparePrice: true,
          tva: true,
          stock: true,
          images: true,
          sku: true,
          updatedAt: true,
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.product.findMany({
        where: { stock: { gt: 0, lt: STOCK_MIN_THRESHOLD }, status: "PUBLISHED" },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          comparePrice: true,
          tva: true,
          stock: true,
          images: true,
          sku: true,
          updatedAt: true,
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { stock: "asc" },
      }),
    ]);

    const serialize = (product: typeof outOfStock[number]) => {
      const priceHT = product.price.toNumber();
      const breakdown = getPriceBreakdown(priceHT, product.tva); 
      return {
        ...product,
        price: priceHT,
        comparePrice: product.comparePrice?.toNumber() || null,
        priceTTC: breakdown.priceTTC,
        priceBreakdown: breakdown,
        image: product.images[0] || null,
      };
    };

    const serializedOutOfStock = outOfStock.map(serialize);
    const serializedLowStock = lowStock.map(serialize);

    apiLogger.warn(
      `Alertes stock: ${serializedOutOfStock.length} rupture(s), ${serializedLowStock.length} stock(s) faible(s)`
    );

    return loggedSuccessResponse({
      threshold: STOCK_MIN_THRESHOLD,
      outOfStock: serializedOutOfStock.length,
      lowStock: serializedLowStock.length,
      products: {
        outOfStock: serializedOutOfStock,
        lowStock: serializedLowStock,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(`GET stock alerts error: ${message}`);
    return loggedErrorResponse("Erreur lors de la récupération des alertes stock", 500);
  }
});