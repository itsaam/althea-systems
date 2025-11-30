import CategoryForm from "@/components/admin/category-form";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Modifier la catégorie</h1>
      <CategoryForm categoryId={id} />
    </div>
  );
}
