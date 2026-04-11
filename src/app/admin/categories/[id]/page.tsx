import EditCategoryPageClient from "./edit-client";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;
  return <EditCategoryPageClient categoryId={id} />;
}
