interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Commande #{id}</h1>
      {/* Order details */}
    </div>
  );
}
