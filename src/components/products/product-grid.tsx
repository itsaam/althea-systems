"use client";

import ProductCard from "@/components/products/product-card";

interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  image?: string;
  stock: number;
}

interface ProductGridProps {
  products: Product[];
  categoryName?: string;
}

export default function ProductGrid({
  products,
  categoryName,
}: ProductGridProps) {
  const total = products.length;

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 md:gap-x-8 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          {...product}
          categoryName={categoryName}
          index={index}
          total={total}
        />
      ))}
    </div>
  );
}
