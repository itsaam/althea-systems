import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductViewClient from "@/components/admin/product-view-client";

interface ProductViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductViewPage({ params }: ProductViewPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
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

  if (!product) {
    notFound();
  }

  // Sérialiser les Decimals et Dates pour passage au Client Component
  const serializedProduct = {
    ...product,
    price: product.price.toNumber(),
    comparePrice: product.comparePrice ? product.comparePrice.toNumber() : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };

  return <ProductViewClient product={serializedProduct} />;
}
