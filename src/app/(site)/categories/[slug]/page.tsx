import type { Metadata } from "next";
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
    title: `${category.name} - Equipements medicaux`,
    description,
    openGraph: {
      title: `${category.name} - Althea Systems`,
      description,
      url: canonical,
      type: "website",
      siteName: "Althea Systems",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} - Althea Systems`,
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

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
      </div>

      {category.products.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Aucun produit dans cette categorie
          </p>
        </div>
      ) : (
        <ProductGrid products={category.products} />
      )}
    </div>
  );
}
