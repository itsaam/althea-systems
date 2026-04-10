import { OrderDetailView } from "@/components/admin/orders/order-detail-view";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetailView orderId={id} />;
}
