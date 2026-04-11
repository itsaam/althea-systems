import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/products/product-grid";
import { productLogger } from "@/lib/logger/exports";
import { prisma } from "@/lib/prisma";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

async function getCategoryWithProducts(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: {
            status: "PUBLISHED",
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!category) return null;

    return {
      ...category,
      products: category.products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price.toNumber(),
        image: product.images[0] || undefined,
        stock: product.stock,
      })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`Erreur recuperation categorie ${slug}: ${message}`);
    return null;
  }
}

async function getCategory(slug: string) {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      select: {
        name: true,
        slug: true,
        description: true,
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Categorie non trouvee" };
  }

  const description =
    category.description ||
    `Decouvrez nos equipements medicaux dans la categorie ${category.name}.`;
  const canonical = `/categories/${category.slug}`;

  return {
    title: `${category.name} — Althea Systems`,
    description,
    openGraph: {
      title: `${category.name} — Althea Systems`,
      description,
      url: canonical,
      type: "website",
      siteName: "Althea Systems",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} — Althea Systems`,
      description,
      site: "@altheasystems",
    },
    alternates: {
      canonical,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const category = await getCategoryWithProducts(slug);

  if (!category) {
    notFound();
  }

  const productCount = category.products.length;

  return (
    <div className="bg-background text-foreground">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative isolate grain overflow-hidden border-b border-border/60">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pb-20 lg:pt-32">
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-y-3">
            <nav
              aria-label="Fil d'Ariane"
              className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50"
            >
              <Link
                href="/"
                className="transition-colors hover:text-foreground"
              >
                Accueil
              </Link>
              <span aria-hidden="true" className="text-foreground/30">
                ·
              </span>
              <Link
                href="/categories"
                className="transition-colors hover:text-foreground"
              >
                Catégories
              </Link>
              <span aria-hidden="true" className="text-foreground/30">
                ·
              </span>
              <span className="text-foreground">{category.name}</span>
            </nav>
            <p className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/40 tabular-nums sm:block">
              Index · 006 / {slug}
            </p>
          </div>

          <h1 className="mt-16 font-display text-h1 leading-[1] tracking-[-0.03em] text-foreground lg:mt-20">
            {category.name}
            <span className="text-electric-indigo-500">.</span>
          </h1>

          <div className="mt-10 grid grid-cols-1 gap-6 border-t border-border/60 pt-8 lg:grid-cols-12">
            {category.description ? (
              <p className="text-lead text-foreground/70 lg:col-span-7 lg:col-start-1">
                {category.description}
              </p>
            ) : (
              <p className="text-lead text-foreground/70 lg:col-span-7 lg:col-start-1">
                Sélection certifiée par notre comité clinique. Livraison 48h,
                support humain, garantie constructeur.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 lg:col-span-4 lg:col-start-9 lg:justify-end">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50 tabular-nums">
                {String(productCount).padStart(3, "0")}{" "}
                {productCount > 1 ? "produits" : "produit"}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                CE · ISO 13485
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Products ─────────────────────────────────────────────── */}
      <section className="relative isolate grain overflow-hidden">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
          {productCount === 0 ? (
            <div className="border-y border-border/60 py-24 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
                Stock · 000 / Vide
              </p>
              <p className="mt-4 text-body text-foreground/70">
                Aucun produit publié dans cette catégorie pour le moment.
              </p>
              <Link
                href="/categories"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
              >
                ← Retour au catalogue
              </Link>
            </div>
          ) : (
            <div className="border-t border-border/60 pt-10">
              <ProductGrid products={category.products} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
