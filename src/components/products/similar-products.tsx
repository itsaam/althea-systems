import ProductCarousel from "@/components/products/product-carousel";

interface Product {
  id: string;
  name: string;
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
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
      <ProductCarousel products={products} />
    </section>
  );
}
