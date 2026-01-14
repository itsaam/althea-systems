import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/products/product-grid";

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
    console.error("Erreur récupération catégorie:", error);
    return null;
  }
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
    </div>
  );
}
