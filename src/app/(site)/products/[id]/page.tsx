import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SimilarProducts from "@/components/products/similar-products";
import StockBadge from "@/components/products/stock-badge";
import { Button } from "@/components/ui/button";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(identifier: string) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier },
        ],
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) return null;

    return {
      ...product,
      price: product.price.toNumber(),
      comparePrice: product.comparePrice?.toNumber() || null,
      image: product.images[0] || null,
    };
  } catch (error) {
    console.error("Erreur récupération produit:", error);
    return null;
  }
}

async function getSimilarProducts(identifier: string) {
  try {
    // Récupérer le produit pour avoir son ID et sa catégorie
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier },
        ],
      },
      select: { id: true, categoryId: true },
    });

    if (!product) {
      console.log("❌ Produit non trouvé pour getSimilarProducts:", identifier);
      return [];
    }

    console.log("✅ Produit trouvé:", product.id, "Catégorie:", product.categoryId);

    const similarProducts = await prisma.$queryRaw<any[]>`
      SELECT id, name, slug, price, images, stock
      FROM "Product"
      WHERE "categoryId" = ${product.categoryId}
        AND id != ${product.id}
        AND status = 'PUBLISHED'
      ORDER BY RANDOM()
      LIMIT 6
    `;

    console.log(`📦 Produits similaires trouvés: ${similarProducts.length}`);

    return similarProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      image: p.images?.[0] || null,
      stock: p.stock,
    }));
  } catch (error) {
    console.error("❌ Erreur chargement produits similaires:", error);
    return [];
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const [product, similarProducts] = await Promise.all([
    getProduct(id),
    getSimilarProducts(id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="container py-8">
      {/* Product Details */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Image */}
        <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Aucune image
            </div>
          )}
          <StockBadge stock={product.stock} className="absolute top-4 right-4" />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.category && (
              <p className="text-muted-foreground">
                Catégorie : {product.category.name}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{product.price.toFixed(2)} €</span>
            {product.comparePrice && (
              <span className="text-lg text-muted-foreground line-through">
                {product.comparePrice.toFixed(2)} €
              </span>
            )}
          </div>

          {product.description && (
            <div>
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Stock disponible : {product.stock}
            </span>
          </div>

          <Button size="lg" className="w-full md:w-auto" disabled={product.stock === 0}>
            {product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
          </Button>
        </div>
      </div>

      {/* Similar Products */}
      <SimilarProducts products={similarProducts} />
    </div>
  );
}
