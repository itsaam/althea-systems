import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface SearchProduct {
  id: string;
  name: string;
  slug: string | null;
  price: number;
  image?: string;
  categoryId?: string | null;
  category?: {
    name: string;
    slug: string | null;
  } | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";
    const categoryId = searchParams.get("categoryId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    // Validation
    if (!query && !categoryId) {
      return NextResponse.json(
        { message: "Veuillez fournir une query ou une catégorie" },
        { status: 400 }
      );
    }

    // Construire le filtre
    const whereClause: Record<string, unknown> = {
      status: "PUBLISHED",
    };

    // Recherche textuelle
    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    // Filtre catégorie
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    // Filtre prix
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) {
        priceFilter.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        priceFilter.lte = parseFloat(maxPrice);
      }
      whereClause.price = priceFilter;
    }

    // Recherche
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      take: 50,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Formater les résultats
    const formattedProducts: SearchProduct[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      image: p.images?.[0] || undefined,
      categoryId: p.categoryId || undefined,
      category: p.category || undefined,
    }));

    return NextResponse.json({
      query,
      count: formattedProducts.length,
      products: formattedProducts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    console.error("Search error:", error);
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
