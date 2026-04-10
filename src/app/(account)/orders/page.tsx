import type { Metadata } from "next";
import OrderHistory from "@/components/account/order-history";

export const metadata: Metadata = {
  title: "Mes commandes",
  description:
    "Retrouvez l'historique complet de vos commandes Althea Systems, avec filtres, statuts et téléchargement de factures.",
};

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          Historique des commandes
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Consultez, filtrez et téléchargez les factures de toutes vos
          commandes passées.
        </p>
      </div>
      <OrderHistory />
    </div>
  );
}
