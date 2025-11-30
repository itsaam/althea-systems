import PaymentMethods from "@/components/account/payment-methods";

export default function PaymentsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Méthodes de paiement</h1>
      <PaymentMethods />
    </div>
  );
}
