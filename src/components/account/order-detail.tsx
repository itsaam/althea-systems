"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  product?: {
    id: string;
    name: string;
    slug?: string;
    images?: string[];
  };
}

interface OrderAddress {
  firstName: string;
  lastName: string;
  street: string;
  street2?: string | null;
  city: string;
  postalCode: string;
  region?: string | null;
  country: string;
  phone?: string | null;
}

interface OrderDetailData {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  address: OrderAddress;
  items: OrderItem[];
  invoice?: { id: string; invoiceNumber: string; amount: number } | null;
  statusHistory?: { id: string; status: OrderStatus; createdAt: string }[];
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  FAILED: "Échec",
  REFUNDED: "Remboursée",
};

const STATUS_TIMELINE: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

interface OrderDetailProps {
  orderId: string;
}

export default function OrderDetail({ orderId }: OrderDetailProps) {
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    fetch(`/api/orders/${orderId}`)
      .then((res) =>
        res.ok
          ? res.json()
          : res.json().then((data) => {
              throw new Error(data?.error || "Commande introuvable");
            })
      )
      .then((data) => {
        if (!active) return;
        const payload = data?.data ?? data;
        setOrder(payload?.order ?? null);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderId]);

  const handleDownloadInvoice = async () => {
    if (!order?.invoice) return;
    try {
      const res = await fetch(`/api/invoices/${order.invoice.id}/pdf`);
      if (!res.ok) throw new Error("PDF indisponible");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facture-${order.invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    }
  };

  if (isLoading) {
    return (
      <div aria-busy="true" className="space-y-10">
        <div className="h-4 w-48 animate-pulse rounded bg-foreground/5" />
        <div className="h-20 w-full animate-pulse rounded bg-foreground/5" />
        <div className="h-40 w-full animate-pulse rounded bg-foreground/5" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-8">
        <Link
          href="/orders"
          className="inline-flex font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55 hover:text-foreground"
        >
          ← Retour aux commandes
        </Link>
        <div className="border-t border-border/60 pt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
            <span className="mr-1.5 opacity-60">—</span>
            Erreur
          </p>
          <h2 className="mt-4 font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground">
            Commande introuvable
            <span
              aria-hidden
              className="ml-1 inline-block h-1.5 w-1.5 translate-y-[-0.25em] rounded-full bg-electric-indigo-500 align-middle"
            />
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-foreground/60">
            {error ??
              "Cette commande n'existe pas ou vous n'avez pas accès à ses détails."}
          </p>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED";
  const currentStep = STATUS_TIMELINE.indexOf(order.status);

  return (
    <div className="space-y-14">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/50">
        <Link
          href="/orders"
          className="transition-colors hover:text-foreground"
        >
          Mes commandes
        </Link>
        <span className="text-foreground/20">·</span>
        <span className="tabular-nums text-foreground/70">
          {order.orderNumber}
        </span>
      </div>

      {/* Header */}
      <header className="flex flex-col gap-6 border-b border-border/60 pb-8 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="min-w-0">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
            <span className="opacity-60">—</span>
            <span>Commande</span>
            <span className="text-foreground/20">/</span>
            <span className="tabular-nums">{order.orderNumber}</span>
          </div>
          <h1 className="mt-4 font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.025em] text-foreground md:text-[44px]">
            Commande du {formatShortDate(order.createdAt)}
            <span
              aria-hidden
              className="ml-1 inline-block h-1.5 w-1.5 translate-y-[-0.25em] rounded-full bg-electric-indigo-500 align-middle"
            />
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-foreground/60">
            {order.items.length} produit{order.items.length > 1 ? "s" : ""} ·{" "}
            <span className="tabular-nums text-foreground">
              {formatCurrency(order.total)}
            </span>
          </p>
        </div>
        {order.invoice && (
          <button
            type="button"
            onClick={handleDownloadInvoice}
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-border/60 bg-background px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-foreground"
          >
            Télécharger la facture
          </button>
        )}
      </header>

      {/* Timeline */}
      {!isCancelled ? (
        <section>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
            <span className="mr-1.5 opacity-60">—</span>
            Suivi
          </p>
          <ol className="mt-6 grid grid-cols-5 gap-2">
            {STATUS_TIMELINE.map((step, index) => {
              const isActive = index <= currentStep;
              const isCurrent = index === currentStep;
              return (
                <li
                  key={step}
                  className="flex flex-col items-start gap-3 border-t-2 pt-3"
                  style={{
                    borderColor: isActive
                      ? "var(--color-electric-indigo-500, #5b12ed)"
                      : "color-mix(in oklab, currentColor 15%, transparent)",
                  }}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-foreground/40 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[11px] uppercase tracking-[0.14em] leading-tight",
                      isActive ? "text-foreground" : "text-foreground/40"
                    )}
                  >
                    {STATUS_LABEL[step]}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      ) : (
        <div className="border-l-2 border-destructive pl-5 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-destructive">
            Commande annulée
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-foreground/70">
            Cette commande a été annulée. Si vous avez été débité, le
            remboursement est en cours de traitement.
          </p>
        </div>
      )}

      {/* Articles */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
          <span className="mr-1.5 opacity-60">—</span>
          Articles commandés
        </p>
        <ul className="mt-6 divide-y divide-border/60">
          {order.items.map((item) => {
            const image = item.product?.images?.[0];
            const href = item.product?.slug
              ? `/products/${item.product.slug}`
              : item.product?.id
                ? `/products/${item.product.id}`
                : null;
            const totalLine = item.price * item.quantity;

            return (
              <li
                key={item.id}
                className="flex items-center gap-5 py-5 first:pt-0"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden border border-border/60 bg-foreground/[0.02]">
                  {image ? (
                    <Image
                      src={image}
                      alt=""
                      fill
                      className="object-cover grayscale"
                      sizes="80px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  {href ? (
                    <Link
                      href={href}
                      className="font-mono text-[12px] uppercase tracking-[0.08em] text-foreground transition-colors hover:underline"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-foreground">
                      {item.name}
                    </p>
                  )}
                  <p className="mt-1.5 font-mono text-[11px] tabular-nums text-foreground/55">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <div className="text-right font-mono text-[13px] font-medium tabular-nums text-foreground">
                  {formatCurrency(totalLine)}
                </div>
              </li>
            );
          })}
        </ul>

        <dl className="mt-8 space-y-2 border-t border-border/60 pt-6 font-mono text-[12px] tabular-nums">
          <div className="flex justify-between text-foreground/60">
            <dt>Sous-total HT</dt>
            <dd>{formatCurrency(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-foreground/60">
            <dt>TVA</dt>
            <dd>{formatCurrency(order.tax)}</dd>
          </div>
          <div className="flex justify-between text-foreground/60">
            <dt>Livraison</dt>
            <dd>
              {order.shippingCost === 0
                ? "Offerte"
                : formatCurrency(order.shippingCost)}
            </dd>
          </div>
          <div className="mt-4 flex justify-between border-t border-border/60 pt-4 text-[14px] font-semibold text-foreground">
            <dt className="uppercase tracking-[0.14em]">Total TTC</dt>
            <dd>{formatCurrency(order.total)}</dd>
          </div>
        </dl>
      </section>

      {/* Addresses + payment */}
      <section className="grid gap-10 md:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
            <span className="mr-1.5 opacity-60">—</span>
            Adresse de livraison
          </p>
          <address className="mt-6 not-italic text-[14px] leading-relaxed text-foreground/70">
            <p className="font-medium text-foreground">
              {order.address.firstName} {order.address.lastName}
            </p>
            <p>{order.address.street}</p>
            {order.address.street2 && <p>{order.address.street2}</p>}
            <p className="tabular-nums">
              {order.address.postalCode} {order.address.city}
            </p>
            {order.address.region && <p>{order.address.region}</p>}
            <p className="font-medium text-foreground/80">
              {order.address.country}
            </p>
            {order.address.phone && (
              <p className="pt-2 font-mono text-[11px] tabular-nums text-foreground/55">
                {order.address.phone}
              </p>
            )}
          </address>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
            <span className="mr-1.5 opacity-60">—</span>
            Paiement
          </p>
          <dl className="mt-6 space-y-3 font-mono text-[12px]">
            <div className="flex items-center justify-between">
              <dt className="uppercase tracking-[0.14em] text-foreground/55">
                Statut
              </dt>
              <dd
                className={cn(
                  "border border-border/60 px-2 py-1 text-[9px] uppercase tracking-[0.14em]",
                  order.paymentStatus === "PAID"
                    ? "text-foreground"
                    : order.paymentStatus === "FAILED"
                      ? "text-destructive"
                      : "text-foreground/70"
                )}
              >
                {PAYMENT_STATUS_LABEL[order.paymentStatus]}
              </dd>
            </div>
            {order.paymentMethod && (
              <div className="flex items-center justify-between">
                <dt className="uppercase tracking-[0.14em] text-foreground/55">
                  Méthode
                </dt>
                <dd className="text-foreground">{order.paymentMethod}</dd>
              </div>
            )}
            {order.invoice && (
              <div className="flex items-center justify-between">
                <dt className="uppercase tracking-[0.14em] text-foreground/55">
                  Facture
                </dt>
                <dd className="tabular-nums text-foreground">
                  {order.invoice.invoiceNumber}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      {/* History */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <section>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
            <span className="mr-1.5 opacity-60">—</span>
            Historique du suivi
          </p>
          <ol className="mt-6 space-y-4">
            {order.statusHistory.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between border-l-2 border-border/60 pl-5 py-1"
              >
                <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-foreground">
                  {STATUS_LABEL[entry.status]}
                </p>
                <p className="font-mono text-[11px] tabular-nums text-foreground/50">
                  {formatDateTime(entry.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Notes */}
      {order.notes && (
        <section>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
            <span className="mr-1.5 opacity-60">—</span>
            Notes
          </p>
          <p className="mt-4 whitespace-pre-line text-[14px] leading-relaxed text-foreground/70">
            {order.notes}
          </p>
        </section>
      )}

      <p className="sr-only">
        Dernière mise à jour : {formatDate(order.updatedAt)}
      </p>
    </div>
  );
}
