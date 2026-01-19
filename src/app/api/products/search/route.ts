import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get('q') || '';
    const categoryId = searchParams.get('categoryId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const filters: Prisma.ProductWhereInput[] = [];

    if (q) {
      filters.push({
        name: { contains: q, mode: 'insensitive' },
      });
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

    const where: Prisma.ProductWhereInput = filters.length
      ? { AND: filters }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    const serializedProducts = products.map((p) => ({
      ...p,
      price: p.price.toNumber(),
      comparePrice: p.comparePrice?.toNumber() ?? null,
      image: p.images[0] ?? null,
    }));

    return NextResponse.json({
      products: serializedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /products/search error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche de produits' },
      { status: 500 }
    );
  }
}
