import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productLogger } from "@/lib/logger/exports";
import SimilarProducts from "@/components/products/similar-products";
import StockBadge from "@/components/products/stock-badge";
import AddToCartButton from "@/components/cart/add-to-cart-button";
import type { Metadata } from "next";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://althea.vjuya.me";

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
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`Erreur récupération produit ${identifier}: ${message}`);
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
      productLogger.warn(`Produit non trouvé pour getSimilarProducts: ${identifier}`);
      return [];
    }

    productLogger.debug(`Produit trouvé: ${product.id}, Catégorie: ${product.categoryId}`);

    interface SimilarProductRow {
      id: string;
      name: string;
      slug: string | null;
      price: number;
      images: string[];
      stock: number;
    }

    const similarProducts = await prisma.$queryRaw<SimilarProductRow[]>`
      SELECT id, name, slug, price, images, stock
      FROM "Product"
      WHERE "categoryId" = ${product.categoryId}
        AND id != ${product.id}
        AND status = 'PUBLISHED'
      ORDER BY RANDOM()
      LIMIT 6
    `;

    productLogger.info(`${similarProducts.length} produits similaires trouvés pour ${identifier}`);

    return similarProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug ?? undefined,
      price: Number(p.price),
      image: p.images?.[0] ?? undefined,
      stock: p.stock,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`Erreur chargement produits similaires pour ${identifier}: ${message}`);
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Produit non trouve",
    };
  }

  return {
    title: product.name,
    description:
      product.description ||
      `Decouvrez ${product.name} chez Althea Systems. Equipement medical de qualite.`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.images.length > 0 ? product.images : undefined,
      url: `${BASE_URL}/products/${product.id}`,
      type: "website",
    },
    alternates: {
      canonical: `${BASE_URL}/products/${product.id}`,
    },
  };
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

          <div className="w-full md:w-auto">
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              price={product.price}
              image={product.image || undefined}
              disabled={product.stock === 0}
            />
          </div>
        </div>
      </div>

      {/* Similar Products */}
      <SimilarProducts products={similarProducts} />
      <ProductJsonLd
        name={product.name}
        description={product.description || ""}
        image={product.images}
        sku={product.sku || undefined}
        price={Number(product.price)}
        availability={product.stock > 0 ? "InStock" : "OutOfStock"}
        url={`${BASE_URL}/products/${product.id}`}
        category={product.category?.name}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: BASE_URL },
          { name: "Produits", url: `${BASE_URL}/categories` },
          ...(product.category
            ? [
                {
                  name: product.category.name,
                  url: `${BASE_URL}/categories/${product.category.slug}`,
                },
              ]
            : []),
          {
            name: product.name,
            url: `${BASE_URL}/products/${product.id}`,
          },
        ]}
      />
      <h1 className="text-3xl font-bold mb-8">{product.name}</h1>
      {/* Product details */}
    </div>
  );
}
