"use client";

import ProductCarousel from "@/components/products/product-carousel";

interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  image?: string;
  stock: number;
}

interface SimilarProductsProps {
  products: Product[];
}

export default function SimilarProducts({ products }: SimilarProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-24 md:mt-36">
      <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="eyebrow">Dans la même famille</p>
          <h2 className="font-display mt-5 text-display-sm text-shadow-grey-900">
            Produits{" "}
            <em className="not-italic italic text-brand-gradient">similaires</em>
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-shadow-grey-600">
          Sélectionnés par nos experts pour leur qualité et leur complémentarité avec cet équipement.
        </p>
      </div>
      <ProductCarousel products={products} />
    </section>
  );
}
