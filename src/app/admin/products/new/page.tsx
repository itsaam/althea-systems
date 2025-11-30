import ProductForm from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Nouveau produit</h1>
      <ProductForm />
    </div>
  );
}
