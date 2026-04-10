"use client";

import CheckoutForm from "@/components/checkout/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="container py-10 md:py-14">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Paiement sécurisé
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          Finalisez votre commande
        </h1>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Quatre étapes simples : authentification, adresse, paiement et
          confirmation.
        </p>
      </div>
      <CheckoutForm />
    </div>
  );
}
