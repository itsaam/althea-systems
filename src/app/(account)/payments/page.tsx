import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/account-page-header";
import PaymentMethods from "@/components/account/payment-methods";

export const metadata: Metadata = {
  title: "Moyens de paiement",
  description:
    "Gérez vos cartes bancaires et moyens de paiement enregistrés sur Althea Systems.",
};

export default function PaymentsPage() {
  return (
    <div className="space-y-12">
      <AccountPageHeader
        eyebrow="Paiement"
        index="Index · 004 / Payment"
        title="Moyens de paiement."
        description="Gérez vos cartes enregistrées et vos préférences de paiement pour accélérer vos prochains achats."
      />
      <PaymentMethods />
    </div>
  );
}
