"use client";

import { CreditCard, MapPin, Package, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CheckoutAddress } from "./types";

interface ReviewItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderReviewProps {
  address: CheckoutAddress;
  items: ReviewItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  isGuest: boolean;
  onEditAddress: () => void;
  onEditPayment: () => void;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export default function OrderReview({
  address,
  items,
  subtotal,
  shipping,
  tax,
  total,
  isGuest,
  onEditAddress,
  onEditPayment,
  onConfirm,
  onBack,
  isSubmitting,
}: OrderReviewProps) {
  return (
    <div className="space-y-6">
      <section aria-labelledby="review-items" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3
            id="review-items"
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <Package className="h-4 w-4" aria-hidden="true" />
            Articles ({items.length})
          </h3>
        </div>
        <ul className="divide-y rounded-lg border">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  Quantité : {item.quantity}
                </p>
              </div>
              <p className="font-semibold">
                {(item.price * item.quantity).toFixed(2)} €
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="review-address" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3
            id="review-address"
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Adresse de livraison
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEditAddress}
            className="h-8 text-xs"
          >
            <Pencil className="mr-1 h-3 w-3" aria-hidden="true" />
            Modifier
          </Button>
        </div>
        <div className="rounded-lg border p-4 text-sm">
          <p className="font-medium">
            {address.firstName} {address.lastName}
          </p>
          <p className="text-muted-foreground">{address.email}</p>
          <p className="text-muted-foreground">{address.phone}</p>
          <p className="mt-2">
            {address.street}
            {address.street2 ? `, ${address.street2}` : ""}
          </p>
          <p>
            {address.postalCode} {address.city}, {address.country}
          </p>
        </div>
      </section>

      <section aria-labelledby="review-payment" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3
            id="review-payment"
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <CreditCard className="h-4 w-4" aria-hidden="true" />
            Paiement
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEditPayment}
            className="h-8 text-xs"
          >
            <Pencil className="mr-1 h-3 w-3" aria-hidden="true" />
            Modifier
          </Button>
        </div>
        <div className="rounded-lg border p-4 text-sm">
          <p className="font-medium">Carte bancaire (Stripe)</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Vous serez redirigé vers la page sécurisée Stripe pour saisir
            votre carte.
          </p>
        </div>
      </section>

      <Separator />

      <section aria-labelledby="review-totals" className="space-y-2">
        <h3 id="review-totals" className="sr-only">
          Total de la commande
        </h3>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sous-total</span>
          <span>{subtotal.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Livraison</span>
          <span>{shipping.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">TVA (20 %)</span>
          <span>{tax.toFixed(2)} €</span>
        </div>
        <Separator />
        <div className="flex justify-between pt-1 text-lg font-bold">
          <span>Total TTC</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </section>

      {isGuest && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Commande en tant qu&apos;invité</p>
          <p className="mt-1 text-xs">
            Vous ne pourrez pas suivre votre commande dans un espace personnel
            sans créer de compte. Un récapitulatif vous sera envoyé par email.
          </p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Retour
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          size="lg"
          className="sm:min-w-[240px]"
        >
          {isSubmitting ? "Traitement..." : "Confirmer l'achat"}
        </Button>
      </div>
    </div>
  );
}
