import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
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

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Categorie: {slug}</h1>
      {/* Products grid */}
    </div>
  );
}
