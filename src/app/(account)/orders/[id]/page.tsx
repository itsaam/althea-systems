import type { Metadata } from "next";
import OrderDetail from "@/components/account/order-detail";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Détail de commande",
  description:
    "Consultez le détail d'une commande Althea Systems : articles, livraison, paiement et facture.",
};

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetail orderId={id} />;
}
