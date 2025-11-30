import ProductCard from "@/components/products/product-card";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
}

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
