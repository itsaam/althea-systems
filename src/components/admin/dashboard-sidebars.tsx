"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  MOCK_RECENT_ORDERS,
  MOCK_TOP_PRODUCTS,
} from "@/lib/admin/mock-data";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "en attente",
  CONFIRMED: "confirmée",
  PROCESSING: "préparation",
  SHIPPED: "expédiée",
  DELIVERED: "livrée",
  CANCELLED: "annulée",
};

function formatCurrency(n: number): string {
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

/**
 * Bloc "Top produits" — affiche les best-sellers.
 * Mode dégradé : affiche les MOCK_TOP_PRODUCTS directement (aucun fetch).
 */
export function TopProductsBlock() {
  const items = MOCK_TOP_PRODUCTS;

  return (
    <section className="border-t border-border/60 pt-6">
      <header className="mb-5 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
          <span className="mr-1.5 tabular-nums text-foreground/35">08</span>
          Top produits
        </p>
        <Link
          href="/admin/products"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50 transition-colors hover:text-primary"
        >
          Tout voir
        </Link>
      </header>
      <ul className="divide-y divide-border/40">
        {items.map((item, idx) => (
          <li
            key={item.id}
            className="flex items-center justify-between py-3 first:pt-0"
          >
            <div className="flex items-baseline gap-3 min-w-0">
              <span className="font-mono text-[10px] tabular-nums text-foreground/35">
                {(idx + 1).toString().padStart(2, "0")}
              </span>
              <span className="truncate text-[13px] text-foreground">
                {item.name}
              </span>
            </div>
            <div className="flex items-baseline gap-4 shrink-0">
              <span className="font-mono text-[11px] tabular-nums text-foreground/50">
                <span className="tabular-nums">{item.sold}</span>
                <span className="ml-1 text-foreground/30">vendus</span>
              </span>
              <span className="font-mono text-[11px] tabular-nums text-foreground">
                {formatCurrency(item.revenue)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Bloc "Commandes récentes"
 */
export function RecentOrdersBlock() {
  const items = MOCK_RECENT_ORDERS;

  return (
    <section className="border-t border-border/60 pt-6">
      <header className="mb-5 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
          <span className="mr-1.5 tabular-nums text-foreground/35">09</span>
          Commandes récentes
        </p>
        <Link
          href="/admin/orders"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50 transition-colors hover:text-primary"
        >
          Tout voir
        </Link>
      </header>
      <ul className="divide-y divide-border/40">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between py-3 first:pt-0"
          >
            <div className="flex items-baseline gap-3 min-w-0">
              <span className="font-mono text-[11px] tabular-nums text-foreground/55">
                {item.id}
              </span>
              <span className="truncate text-[13px] text-foreground">
                {item.customer}
              </span>
            </div>
            <div className="flex items-baseline gap-4 shrink-0">
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.18em]",
                  item.status === "DELIVERED"
                    ? "text-foreground/70"
                    : item.status === "PENDING"
                      ? "text-primary"
                      : "text-foreground/45"
                )}
              >
                {STATUS_LABELS[item.status] ?? item.status.toLowerCase()}
              </span>
              <span className="font-mono text-[11px] tabular-nums text-foreground">
                {formatCurrency(item.total)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
