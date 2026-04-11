import EditProductPageClient from "./edit-client";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  return <EditProductPageClient productId={id} />;
}
