import type { Metadata } from "next";
import PaymentMethods from "@/components/account/payment-methods";

export const metadata: Metadata = {
  title: "Moyens de paiement",
  description:
    "Gérez vos cartes bancaires et moyens de paiement enregistrés sur Althea Systems.",
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          Moyens de paiement
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez vos cartes enregistrées et vos préférences de paiement pour
          accélérer vos prochains achats.
        </p>
      </div>
      <PaymentMethods />
    </div>
  );
}
