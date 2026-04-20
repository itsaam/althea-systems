import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import ProductGallery from "@/components/products/product-gallery";
import ProductInfo from "@/components/products/product-info";
import ProductDetailsTabs from "@/components/products/product-details-tabs";
import SimilarProducts from "@/components/products/similar-products";
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
        status: "PUBLISHED",
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
        status: "PUBLISHED",
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

  // Plain-text description extracted from HTML (if any), truncated for SEO
  const rawDescription =
    product.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
    "";
  const description = rawDescription
    ? `${rawDescription.slice(0, 155)}${rawDescription.length > 155 ? "…" : ""}`
    : `${product.name} chez Althea Systems — équipement médical certifié ISO 13485 et CE, livraison 48h. Prix à partir de ${Number(product.price).toFixed(0)} €.`;
  const productUrl = `${BASE_URL}/products/${product.slug}`;

  return {
    title: `${product.name} — Althea Systems`,
    description,
    keywords: [
      product.name,
      "Althea Systems",
      "Althea",
      product.category?.name || "équipement médical",
      "matériel médical professionnel",
    ],
    openGraph: {
      title: `${product.name} — Althea Systems`,
      description,
      images: product.images.length > 0 ? product.images : undefined,
      url: productUrl,
      type: "website",
      siteName: "Althea Systems",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — Althea Systems`,
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

  const shareUrl = `${BASE_URL}/products/${product.slug}`;

  return (
    <div className="relative bg-background">
      {/* ── Editorial breadcrumb ─────────────────────── */}
      <nav
        aria-label="Fil d'ariane"
        className="mx-auto max-w-7xl px-6 pt-10 md:px-10 md:pt-14"
      >
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-shadow-grey-500">
          <li>
            <Link
              href="/"
              className="transition-colors duration-300 hover:text-lavender-mist-600"
            >
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3 w-3" />
          </li>
          <li>
            <Link
              href="/categories"
              className="transition-colors duration-300 hover:text-lavender-mist-600"
            >
              Catalogue
            </Link>
          </li>
          {product.category && (
            <>
              <li aria-hidden="true">
                <ChevronRight className="h-3 w-3" />
              </li>
              <li>
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="transition-colors duration-300 hover:text-lavender-mist-600"
                >
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">
            <ChevronRight className="h-3 w-3" />
          </li>
          <li className="truncate text-shadow-grey-900" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* ── Main product grid ────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-10 md:px-10 md:pb-20 md:pt-14">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} alt={product.name} />
          </div>
          <div className="lg:col-span-5">
            <ProductInfo product={product} shareUrl={shareUrl} />
          </div>
        </div>

        {/* ── Details tabs ─────────────────────────── */}
        <ProductDetailsTabs
          description={product.description}
          sku={product.sku}
          categoryName={product.category?.name}
          stock={product.stock}
        />

        {/* ── Similar products ─────────────────────── */}
        <SimilarProducts products={similarProducts} />
      </div>


      <ProductJsonLd
        name={product.name}
        description={product.description || ""}
        image={product.images}
        sku={product.sku || undefined}
        price={Number(product.price)}
        availability={product.stock > 0 ? "InStock" : "OutOfStock"}
        url={shareUrl}
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
            url: shareUrl,
          },
        ]}
      />
    </div>
  );
}
