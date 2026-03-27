"use client";

import CheckoutForm from "@/components/checkout/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Panier</h1>
        <p className="text-muted-foreground">Finalisez votre commande</p>
      </div>
      <CheckoutForm />
    </div>
  );
}
