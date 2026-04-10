import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import {
  productLogger,
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";
import { getPriceBreakdown } from "@/lib/tva-utils";

export const dynamic = 'force-dynamic';

export const GET = withApiLogger(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '8'));
    const categoryId = searchParams.get('categoryId');

    const where: Prisma.ProductWhereInput = {
      featured: true,
      status: 'PUBLISHED',
    };
    if (categoryId) where.categoryId = categoryId;

    const products = await prisma.product.findMany({
      where,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        comparePrice: true,
        tva: true, 
        stock: true,
        images: true,
        featured: true,
        featuredOrder: true,
        categoryId: true,
        createdAt: true,
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [
        { featuredOrder: { sort: 'asc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
    });

    const serializedProducts = products.map((product) => {
      const priceHT = Number(product.price);
      const breakdown = getPriceBreakdown(priceHT, product.tva); 
      return {
        ...product,
        price: priceHT,
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        priceTTC: breakdown.priceTTC,
        priceBreakdown: breakdown,
        image: product.images?.[0] || null,
      };
    });

    productLogger.info(`${serializedProducts.length} produits mis en avant récupérés`);

    return loggedSuccessResponse(
      { products: serializedProducts, count: serializedProducts.length },
      "Produits mis en avant récupérés"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`Erreur récupération produits mis en avant: ${message}`);
    return loggedErrorResponse(`Erreur récupération produits mis en avant: ${message}`, 500);
  }
});