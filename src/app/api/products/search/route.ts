import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const categoryId = searchParams.get('categoryId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const skip = (page - 1) * limit;

    // Si la recherche est vide, retourne vide
    if (!query) {
      return NextResponse.json({
        products: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        query: '',
      });
    }

    // Construction du filtre
    const filters: any[] = [
      {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
        ],
      },
    ];

    // Filtre catégorie
    if (categoryId) filters.push({ categoryId });

    // Filtre prix
    if (minPrice || maxPrice) {
      const priceFilter: any = {};
      if (minPrice) priceFilter.gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
      filters.push({ price: priceFilter });
    }

    // Tri
    let orderBy: any = [];
    switch (sortBy) {
      case 'price_asc':
        orderBy = [{ price: 'asc' }];
        break;
      case 'price_desc':
        orderBy = [{ price: 'desc' }];
        break;
      case 'newest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'relevance':
      default:
        orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { AND: filters },
        skip,
        take: limit,
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy,
      }),
      prisma.product.count({ where: { AND: filters } }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      query,
      filters: { categoryId, minPrice, maxPrice, sortBy },
    });
  } catch (error) {
    console.error('GET Search products error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche de produits' },
      { status: 500 }
    );
  }
}
