"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

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

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  createdAt: string;
  items: OrderItem[];
  invoice?: { id: string; invoiceNumber: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmée" },
  { value: "PROCESSING", label: "En préparation" },
  { value: "SHIPPED", label: "Expédiée" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

const PAGE_SIZE = 10;

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [rawSearch, setRawSearch] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(rawSearch.trim()), 220);
    return () => clearTimeout(timer);
  }, [rawSearch]);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      const payload = data?.data ?? data;
      setOrders((payload?.orders ?? []) as Order[]);
      setPagination(payload?.pagination ?? null);
    } catch {
      setOrders([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (search.length > 0) {
        const needle = search.toLowerCase();
        const matchOrderNumber = order.orderNumber
          .toLowerCase()
          .includes(needle);
        const matchItem = order.items.some((item) =>
          item.name.toLowerCase().includes(needle)
        );
        const matchDate = formatShortDate(order.createdAt).includes(needle);
        if (!matchOrderNumber && !matchItem && !matchDate) return false;
      }
      return true;
    });
  }, [orders, search]);

  /**
   * Groupement par année (exigence cahier des charges §XIV) :
   * années descendantes, commandes descendantes dans chaque groupe.
   */
  const ordersByYear = useMemo(() => {
    const groups = new Map<number, Order[]>();
    for (const order of filteredOrders) {
      const year = new Date(order.createdAt).getFullYear();
      const bucket = groups.get(year);
      if (bucket) bucket.push(order);
      else groups.set(year, [order]);
    }
    return Array.from(groups.entries())
      .map(([year, list]) => ({
        year,
        orders: [...list].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }))
      .sort((a, b) => b.year - a.year);
  }, [filteredOrders]);

  const hasActiveFilters = statusFilter !== "all" || search.length > 0;

  const resetFilters = () => {
    setStatusFilter("all");
    setRawSearch("");
    setSearch("");
    setPage(1);
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (!res.ok) throw new Error("PDF indisponible");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facture-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div aria-busy="true" className="space-y-4">
        <div className="h-12 w-full animate-pulse rounded bg-foreground/5" />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 w-full animate-pulse rounded bg-foreground/5"
          />
        ))}
      </div>
    );
  }

  if (orders.length === 0 && !isLoading && !hasActiveFilters) {
    return (
      <section className="border-t border-border/60 pt-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
          <span className="mr-1.5 opacity-60">—</span>
          Aucune commande
        </p>
        <h2 className="mt-4 font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground md:text-[34px]">
          Vous n&apos;avez encore rien commandé
          <span
            aria-hidden
            className="ml-1 inline-block h-1.5 w-1.5 translate-y-[-0.25em] rounded-full bg-electric-indigo-500 align-middle"
          />
        </h2>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-foreground/60">
          Dès votre première commande, vous la retrouverez ici avec toutes les
          informations : suivi, facture, détails de livraison.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-foreground px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-background"
        >
          Explorer le catalogue
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-10">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b border-border/60 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <label
            htmlFor="order-search"
            className="block font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55"
          >
            Rechercher
          </label>
          <input
            id="order-search"
            type="search"
            placeholder="Numéro, produit, date…"
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            className="mt-2 block w-full border-0 border-b border-border/60 bg-transparent px-0 py-2 text-[14px] text-foreground placeholder:text-foreground/30 focus:border-foreground focus:outline-none focus:ring-0"
          />
        </div>
        <div className="flex items-end gap-4">
          <div>
            <label
              htmlFor="order-status"
              className="block font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55"
            >
              Statut
            </label>
            <select
              id="order-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-2 block border-0 border-b border-border/60 bg-transparent px-0 py-2 font-mono text-[12px] uppercase tracking-[0.1em] text-foreground focus:border-foreground focus:outline-none focus:ring-0"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55 hover:text-foreground"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Groupes annuels — Cahier des charges §XIV */}
      {filteredOrders.length === 0 ? (
        <div className="border-t border-border/60 py-16 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
            Aucun résultat
          </p>
          <p className="mt-3 text-[14px] text-foreground/60">
            Aucune commande ne correspond à vos critères.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground underline-offset-4 hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="space-y-14">
          {ordersByYear.map(({ year, orders: yearOrders }) => (
            <section
              key={year}
              aria-labelledby={`orders-year-${year}`}
              className="space-y-4"
            >
              <div className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
                <h2
                  id={`orders-year-${year}`}
                  className="font-display text-[32px] font-semibold leading-none tracking-[-0.02em] text-foreground tabular-nums md:text-[40px]"
                >
                  {year}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] tabular-nums text-foreground/50">
                  {yearOrders.length} commande
                  {yearOrders.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <caption className="sr-only">
                    Commandes de l&apos;année {year}
                  </caption>
                  <thead>
                    <tr className="border-b border-border/60 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/50">
                      <th scope="col" className="py-3 pr-4 font-normal">
                        Commande
                      </th>
                      <th scope="col" className="py-3 pr-4 font-normal">
                        Date
                      </th>
                      <th scope="col" className="py-3 pr-4 font-normal">
                        Statut
                      </th>
                      <th
                        scope="col"
                        className="py-3 pr-4 text-right font-normal"
                      >
                        Total
                      </th>
                      <th
                        scope="col"
                        className="py-3 pl-4 text-right font-normal"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearOrders.map((order) => {
                      const itemCount = order.items.reduce(
                        (acc, item) => acc + item.quantity,
                        0
                      );
                      return (
                        <tr
                          key={order.id}
                          className="border-b border-border/60 text-[13px] text-foreground/80 transition-colors hover:bg-foreground/[0.015]"
                        >
                          <td className="py-4 pr-4">
                            <Link
                              href={`/orders/${order.id}`}
                              className="group inline-flex flex-col"
                            >
                              <span className="font-mono text-[12px] tabular-nums text-foreground group-hover:underline">
                                {order.orderNumber}
                              </span>
                              <span className="mt-1 text-[11px] text-foreground/50">
                                {itemCount} article{itemCount > 1 ? "s" : ""}
                              </span>
                            </Link>
                          </td>
                          <td className="py-4 pr-4 font-mono text-[12px] tabular-nums text-foreground/70">
                            {formatShortDate(order.createdAt)}
                          </td>
                          <td className="py-4 pr-4">
                            <span
                              className={cn(
                                "inline-block border border-border/60 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em]",
                                order.status === "CANCELLED"
                                  ? "text-destructive"
                                  : order.status === "DELIVERED"
                                    ? "text-foreground"
                                    : "text-foreground/70"
                              )}
                            >
                              {STATUS_LABEL[order.status]}
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-right font-mono text-[13px] font-medium tabular-nums text-foreground">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="py-4 pl-4 text-right">
                            <div className="inline-flex items-center gap-4">
                              {order.invoice && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownloadInvoice(order.invoice!.id)
                                  }
                                  className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/55 hover:text-foreground"
                                >
                                  Facture
                                </button>
                              )}
                              <Link
                                href={`/orders/${order.id}`}
                                className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground hover:underline"
                              >
                                Voir →
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 pt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/50 tabular-nums">
            Page {pagination.page} / {pagination.totalPages} · {pagination.total}{" "}
            commande{pagination.total > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55 transition-colors hover:text-foreground disabled:opacity-30"
            >
              ← Précédent
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55 transition-colors hover:text-foreground disabled:opacity-30"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {filteredOrders.length} commandes affichées
      </p>
    </section>
  );
}
