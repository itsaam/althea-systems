"use client";

import ProductCard from "@/components/products/product-card";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
}

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
