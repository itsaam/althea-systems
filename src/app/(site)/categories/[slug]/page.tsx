import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productLogger } from "@/lib/logger/exports";
import ProductGrid from "@/components/products/product-grid";
import type { Metadata } from "next";
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
      products: category.products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price.toNumber(),
        image: p.images[0] || undefined,
        stock: p.stock,
      })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`Erreur récupération catégorie ${slug}: ${message}`);
    return null;
  }
async function getCategory(slug: string) {
  try {
    return await prisma.category.findUnique({
      where: { slug },
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

  return {
    title: `${category.name} - Equipements medicaux`,
    description:
      category.description ||
      `Decouvrez nos equipements medicaux dans la categorie ${category.name}.`,
    alternates: {
      canonical: `/categories/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const category = await getCategoryWithProducts(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
      </div>

      {category.products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun produit dans cette catégorie</p>
        </div>
      ) : (
        <ProductGrid products={category.products} />
      )}
      <h1 className="text-3xl font-bold mb-8">Categorie: {slug}</h1>
      {/* Products grid */}
    </div>
  );
}
