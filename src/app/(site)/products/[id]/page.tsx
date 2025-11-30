interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Produit {id}</h1>
      {/* Product details */}
    </div>
  );
}
