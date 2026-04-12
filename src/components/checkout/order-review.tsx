"use client";

import { ArrowUpRight, CreditCard, Loader2, MapPin, Package, Pencil } from "lucide-react";
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

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

function SectionHeader({
  icon: Icon,
  label,
  id,
  onEdit,
}: {
  icon: typeof Package;
  label: string;
  id: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h3
        id={id}
        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50"
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
        {label}
      </h3>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:underline"
        >
          <Pencil className="h-3 w-3" aria-hidden="true" />
          Modifier
        </button>
      )}
    </div>
  );
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
    <div className="space-y-10">
      {/* Articles */}
      <section aria-labelledby="review-items" className="space-y-4">
        <SectionHeader icon={Package} label={`Articles · ${String(items.length).padStart(2, "0")}`} id="review-items" />
        <ul className="divide-y divide-border/40 border border-border/60">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">{item.name}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-foreground/40">Qté · {item.quantity}</p>
              </div>
              <p className="shrink-0 font-mono text-[12px] tabular-nums text-foreground">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Adresse */}
      <section aria-labelledby="review-address" className="space-y-4">
        <SectionHeader icon={MapPin} label="Adresse de livraison" id="review-address" onEdit={onEditAddress} />
        <div className="border border-border/60 px-5 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">{address.firstName} {address.lastName}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50">{address.email} · {address.phone}</p>
          <p className="mt-3 text-[13px] text-foreground/70">{address.street}{address.street2 ? `, ${address.street2}` : ""}</p>
          <p className="text-[13px] text-foreground/70">{address.postalCode} {address.city}, {address.country}</p>
        </div>
      </section>

      {/* Paiement */}
      <section aria-labelledby="review-payment" className="space-y-4">
        <SectionHeader icon={CreditCard} label="Paiement" id="review-payment" onEdit={onEditPayment} />
        <div className="border border-border/60 px-5 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">Carte bancaire · Stripe</p>
          <p className="mt-2 text-[13px] text-foreground/60">Redirection vers la page sécurisée Stripe pour saisir votre carte.</p>
        </div>
      </section>

      {/* Totals */}
      <section aria-labelledby="review-totals" className="border-t border-border/60 pt-8">
        <h3 id="review-totals" className="sr-only">Total de la commande</h3>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50">Sous-total</dt>
            <dd className="font-mono text-[12px] tabular-nums text-foreground">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50">Livraison</dt>
            <dd className="font-mono text-[12px] tabular-nums text-foreground">{formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50">TVA · 20%</dt>
            <dd className="font-mono text-[12px] tabular-nums text-foreground">{formatPrice(tax)}</dd>
          </div>
        </dl>
        <div className="mt-6 flex items-baseline justify-between border-t border-border/60 pt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/60">Total TTC</p>
          <p className="font-mono text-[22px] font-medium tabular-nums text-foreground">{formatPrice(total)}</p>
        </div>
      </section>

      {/* Guest warning */}
      {isGuest && (
        <div className="border border-dashed border-border/60 bg-background p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">Commande en tant qu&apos;invité</p>
          <p className="mt-2 text-[13px] leading-relaxed text-foreground/60">
            Vous ne pourrez pas suivre votre commande sans créer de compte. Un récapitulatif sera envoyé par email.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-8 sm:flex-row sm:justify-between">
        <button type="button" onClick={onBack} disabled={isSubmitting} className="h-11 px-6 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/60 transition-colors hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:underline">
          ← Retour
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="group/cta inline-flex h-12 items-center gap-3 border border-foreground bg-foreground px-8 font-mono text-[10px] uppercase tracking-[0.22em] text-background transition-colors duration-300 hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
        >
          {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isSubmitting ? "Traitement" : "Confirmer l'achat"}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
