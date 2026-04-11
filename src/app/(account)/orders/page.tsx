import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/account-page-header";
import OrderHistory from "@/components/account/order-history";

export const metadata: Metadata = {
  title: "Mes commandes",
  description:
    "Retrouvez l'historique complet de vos commandes Althea Systems, avec filtres, statuts et téléchargement de factures.",
};

export default function OrdersPage() {
  return (
    <div className="space-y-12">
      <AccountPageHeader
        eyebrow="Activité"
        index="Index · 002 / Orders"
        title="Mes commandes."
        description="Consultez, filtrez et téléchargez les factures de toutes vos commandes passées."
      />
      <OrderHistory />
    </div>
  );
}
