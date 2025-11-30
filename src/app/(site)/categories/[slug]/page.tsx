interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Catégorie: {slug}</h1>
      {/* Products grid */}
    </div>
  );
}
