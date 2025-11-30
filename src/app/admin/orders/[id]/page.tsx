import OrderStatusSelect from "@/components/admin/order-status-select";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Commande #{id}</h1>
      <OrderStatusSelect />
      {/* Order details */}
    </div>
  );
}
