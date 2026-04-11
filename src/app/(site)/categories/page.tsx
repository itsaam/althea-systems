import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Catalogue — Althea Systems",
  description:
    "Parcourez nos catégories d'équipements médicaux professionnels. Imagerie, chirurgie, mobilier clinique, monitoring et plus.",
  alternates: {
    canonical: "/categories",
  },
};

interface CategoryWithProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount: number;
}

async function getAllCategories(): Promise<CategoryWithProduct[] | null> {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      productCount: category._count.products,
    }));
  } catch {
    return null;
  }
}

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  const total = categories?.length ?? 0;

  return (
    <div className="bg-background text-foreground">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative isolate grain overflow-hidden border-b border-border/60">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pb-24 lg:pt-32">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
              Althea Systems — Catalogue · FR
            </p>
            <p className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/40 tabular-nums sm:block">
              Index · 006 / Categories
            </p>
          </div>

          <h1 className="mt-16 font-display text-hero leading-[0.88] tracking-[-0.035em] text-foreground lg:mt-24">
            Par domaine<span className="text-electric-indigo-500">.</span>
          </h1>

          <div className="mt-12 grid grid-cols-1 gap-6 border-t border-border/60 pt-8 lg:grid-cols-12">
            <p className="text-lead text-foreground/70 lg:col-span-6 lg:col-start-1">
              Une sélection d&apos;équipements médicaux qualifiés par notre
              comité clinique. Chaque catégorie regroupe des références
              certifiées CE, livrées en 48 heures depuis nos hubs européens.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 lg:col-span-5 lg:col-start-8 lg:justify-end">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50 tabular-nums">
                {String(total).padStart(2, "0")} catégories
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                ISO 13485
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                Made in EU
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Grid ─────────────────────────────────────────────────── */}
      <section className="relative isolate grain overflow-hidden">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          {categories === null ? (
            <div className="border-y border-border/60 py-24 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
                Erreur · 500 / Indisponible
              </p>
              <p className="mt-4 text-body text-foreground/70">
                Impossible de charger les catégories pour le moment.
              </p>
            </div>
          ) : categories.length === 0 ? (
            <div className="border-y border-border/60 py-24 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
                Catalogue · 000 / Vide
              </p>
              <p className="mt-4 text-body text-foreground/70">
                Aucune catégorie disponible pour le moment.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 border-t border-border/60 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category, i) => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="group relative flex h-full flex-col justify-between gap-10 border-b border-border/60 p-8 transition-colors hover:bg-foreground/[0.02] sm:[&:nth-child(2n)]:border-l sm:[&:nth-child(2n)]:border-l-border/60 lg:[&:nth-child(2n)]:border-l-0 lg:[&:nth-child(3n-1)]:border-x lg:[&:nth-child(3n-1)]:border-x-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] tabular-nums text-foreground/40 group-hover:text-electric-indigo-500">
                        {String(i + 1).padStart(2, "0")} /{" "}
                        {String(total).padStart(2, "0")}
                      </span>
                      <span
                        aria-hidden="true"
                        className="font-mono text-sm text-foreground/40 transition-all group-hover:translate-x-1 group-hover:text-electric-indigo-500"
                      >
                        →
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <h2 className="font-display text-h3 leading-[1.05] tracking-[-0.02em] text-foreground transition-colors group-hover:text-electric-indigo-500">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-foreground/60">
                          {category.description}
                        </p>
                      )}
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] tabular-nums text-foreground/50">
                        {String(category.productCount).padStart(3, "0")}{" "}
                        {category.productCount > 1 ? "produits" : "produit"}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
