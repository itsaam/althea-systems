import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET Récupérer les produits mis en avant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');
    const categoryId = searchParams.get('categoryId');

    const where: any = {
      featured: true,
      active: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await prisma.product.findMany({
      where,
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
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('GET Featured products error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits mis en avant' },
      { status: 500 }
    );
  }
}
