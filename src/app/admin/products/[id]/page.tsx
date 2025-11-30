import ProductForm from "@/components/admin/product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Modifier le produit</h1>
      <ProductForm productId={id} />
    </div>
  );
}
