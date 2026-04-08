import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Categories - Equipements medicaux",
  description:
    "Parcourez nos categories d'equipements medicaux professionnels. Materiel de diagnostic, chirurgie, soins et plus.",
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

  return (
    <div className="container py-8">
      <div className="mb-12">
        <h1 className="mb-2 text-3xl font-bold">Cat&eacute;gories</h1>
        <p className="text-muted-foreground">
          Parcourez notre s&eacute;lection de produits par cat&eacute;gorie
        </p>
      </div>

      {categories === null ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Impossible de charger les cat&eacute;gories pour le moment.
          </p>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Aucune cat&eacute;gorie disponible
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group overflow-hidden rounded-lg border border-border transition-colors hover:border-primary"
            >
              <div className="relative h-48 overflow-hidden bg-muted">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                    Pas d&apos;image
                  </div>
                )}
              </div>

              <div className="p-4">
                <h2 className="mb-2 text-lg font-semibold transition-colors group-hover:text-primary">
                  {category.name}
                </h2>

                {category.description && (
                  <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  {category.productCount} produit
                  {category.productCount > 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
