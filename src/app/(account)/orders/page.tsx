import OrderHistory from "@/components/account/order-history";

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Mes commandes</h1>
      <OrderHistory />
    </div>
  );
}
