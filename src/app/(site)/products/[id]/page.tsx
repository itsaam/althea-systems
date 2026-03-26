import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://althea.vjuya.me";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  try {
    return await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  } catch {
    return null;
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
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Produit non trouve</h1>
      </div>
    );
  }

  return (
    <div className="container py-8">
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
