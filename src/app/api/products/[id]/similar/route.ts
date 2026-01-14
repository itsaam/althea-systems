import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Récupérer le produit pour connaître sa catégorie
    const product = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer 6 produits aléatoires de la même catégorie (excluant le produit actuel)
    const similarProducts = await prisma.$queryRaw`
      SELECT id, name, slug, price, images, stock
      FROM "Product"
      WHERE "categoryId" = ${product.categoryId}
        AND id != ${id}
        AND active = true
      ORDER BY RANDOM()
      LIMIT 6
    `;

    // Sérialiser les produits
    const serializedProducts = (similarProducts as any[]).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      image: p.images?.[0] || null,
      stock: p.stock,
    }));

    return NextResponse.json({ products: serializedProducts });
  } catch (error) {
    console.error("Erreur récupération produits similaires:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits similaires" },
      { status: 500 }
    );
  }
}
