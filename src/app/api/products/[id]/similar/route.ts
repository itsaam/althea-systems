import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  productLogger,
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";

// Interface pour typer les résultats de la requête SQL
interface SimilarProductRow {
  id: string;
  name: string;
  slug: string | null;
  price: number;
  images: string[];
  stock: number;
}

export const GET = withApiLogger(async (
  request: NextRequest,
  context?: unknown
) => {
  try {
    const params = (context as { params: Promise<{ id: string }> })?.params;
    if (!params) {
      return loggedErrorResponse("Paramètres manquants", 400);
    }

    const { id } = await params;

    // Récupérer le produit pour connaître sa catégorie
    const product = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true },
    });

    if (!product) {
      return loggedErrorResponse("Produit non trouvé", 404);
    }

    // Récupérer 6 produits aléatoires de la même catégorie (excluant le produit actuel)
    const similarProducts = await prisma.$queryRaw<SimilarProductRow[]>`
      SELECT id, name, slug, price, images, stock
      FROM "Product"
      WHERE "categoryId" = ${product.categoryId}
        AND id != ${id}
        AND status = 'PUBLISHED'
      ORDER BY RANDOM()
      LIMIT 6
    `;

    // Sérialiser les produits
    const serializedProducts = similarProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug ?? undefined,
      price: Number(p.price),
      image: p.images?.[0] ?? undefined,
      stock: p.stock,
    }));

    productLogger.info(`${serializedProducts.length} produits similaires récupérés pour le produit ${id}`);
    return loggedSuccessResponse(
      { products: serializedProducts },
      `Produits similaires récupérés`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur récupération produits similaires: ${message}`, 500);
  }
});
