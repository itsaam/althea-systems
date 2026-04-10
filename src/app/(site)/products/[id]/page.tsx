import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/cart/add-to-cart-button";
import ShareButtons from "@/components/products/share-buttons";
import SimilarProducts from "@/components/products/similar-products";
import StockBadge from "@/components/products/stock-badge";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/seo/json-ld";
import { productLogger } from "@/lib/logger/exports";
import { prisma } from "@/lib/prisma";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://althea.vjuya.me";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(identifier: string) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
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
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      select: { id: true, categoryId: true },
    });

    if (!product) {
      productLogger.warn(
        `Produit non trouve pour getSimilarProducts: ${identifier}`
      );
      return [];
    }

    productLogger.debug(
      `Produit trouve: ${product.id}, Categorie: ${product.categoryId}`
    );

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

    productLogger.info(
      `${similarProducts.length} produits similaires trouves pour ${identifier}`
    );

    return similarProducts.map((similarProduct) => ({
      id: similarProduct.id,
      name: similarProduct.name,
      slug: similarProduct.slug ?? undefined,
      price: Number(similarProduct.price),
      image: similarProduct.images?.[0] ?? undefined,
      stock: similarProduct.stock,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(
      `Erreur chargement produits similaires pour ${identifier}: ${message}`
    );
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

  const description =
    product.description ||
    `Decouvrez ${product.name} chez Althea Systems. Equipement medical de qualite.`;
  const productUrl = `${BASE_URL}/products/${product.id}`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.images.length > 0 ? product.images : undefined,
      url: productUrl,
      type: "website",
      siteName: "Althea Systems",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.images.length > 0 ? product.images : undefined,
      site: "@altheasystems",
      creator: "@altheasystems",
    },
    alternates: {
      canonical: productUrl,
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
    <div className="container py-8 md:py-12">
      <div className="mb-10 grid gap-6 md:mb-12 md:grid-cols-2 md:gap-8 lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Aucune image
            </div>
          )}
          <StockBadge stock={product.stock} className="absolute right-3 top-3 md:right-4 md:top-4" />
        </div>

        <div className="flex flex-col gap-5 md:gap-6">
          <div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>
            {product.category && (
              <p className="text-sm text-muted-foreground">
                Categorie : {product.category.name}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-2xl font-bold sm:text-3xl">
              {product.price.toFixed(2)} €
            </span>
            {product.comparePrice && (
              <span className="text-base text-muted-foreground line-through sm:text-lg">
                {product.comparePrice.toFixed(2)} €
              </span>
            )}
          </div>

          {product.description && (
            <div>
              <h2 className="mb-2 font-semibold">Description</h2>
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

          <div className="mt-2 border-t pt-5">
            <ShareButtons
              url={`${BASE_URL}/products/${product.id}`}
              title={product.name}
              description={product.description || undefined}
            />
          </div>
        </div>
      </div>

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
    </div>
  );
}
