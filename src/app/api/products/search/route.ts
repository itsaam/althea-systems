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

export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get('q') || '';
    const categoryId = searchParams.get('categoryId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10'));
    const skip = (page - 1) * limit;

    const filters: Prisma.ProductWhereInput[] = [{ status: 'PUBLISHED' }]; 

    if (q) {
      filters.push({ name: { contains: q, mode: 'insensitive' } });
    }
    if (categoryId) {
      filters.push({ categoryId });
    }
    if (minPrice || maxPrice) {
      const priceFilter: Prisma.DecimalFilter = {};
      if (minPrice) priceFilter.gte = new Prisma.Decimal(minPrice);
      if (maxPrice) priceFilter.lte = new Prisma.Decimal(maxPrice);
      filters.push({ price: priceFilter });
    }

    const where: Prisma.ProductWhereInput = { AND: filters };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
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
          status: true,
          categoryId: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    const serializedProducts = products.map((p) => {
      const priceHT = Number(p.price);
      const breakdown = getPriceBreakdown(priceHT, p.tva); 
      return {
        ...p,
        price: priceHT,
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        priceTTC: breakdown.priceTTC,
        priceBreakdown: breakdown,
        image: p.images[0] ?? null,
      };
    });

    productLogger.info(`Recherche "${q}" → ${total} résultats (page ${page}/${Math.ceil(total / limit)})`);

    return loggedSuccessResponse({
      products: serializedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`GET /products/search error: ${message}`);
    return loggedErrorResponse('Erreur lors de la recherche de produits', 500);
  }
});