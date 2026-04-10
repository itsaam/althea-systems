"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Package,
  PackageX,
  Receipt,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "En attente",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  },
  CONFIRMED: {
    label: "Confirmée",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  },
  PROCESSING: {
    label: "En préparation",
    className: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700",
  },
  SHIPPED: {
    label: "Expédiée",
    className: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700",
  },
  DELIVERED: {
    label: "Livrée",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  },
  CANCELLED: {
    label: "Annulée",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Tous les statuts" },
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

const PAGE_SIZE = 10;

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
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

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    orders.forEach((order) => {
      years.add(new Date(order.createdAt).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (yearFilter !== "all") {
        const year = new Date(order.createdAt).getFullYear();
        if (String(year) !== yearFilter) return false;
      }
      if (search.length > 0) {
        const needle = search.toLowerCase();
        const matchOrderNumber = order.orderNumber.toLowerCase().includes(needle);
        const matchItem = order.items.some((item) =>
          item.name.toLowerCase().includes(needle)
        );
        const matchDate = formatShortDate(order.createdAt).includes(needle);
        if (!matchOrderNumber && !matchItem && !matchDate) return false;
      }
      return true;
    });
  }, [orders, search, yearFilter]);

  const groupedByYear = useMemo(() => {
    const groups = new Map<number, Order[]>();
    filteredOrders.forEach((order) => {
      const year = new Date(order.createdAt).getFullYear();
      const bucket = groups.get(year) ?? [];
      bucket.push(order);
      groups.set(year, bucket);
    });
    return Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
  }, [filteredOrders]);

  const hasActiveFilters =
    statusFilter !== "all" || yearFilter !== "all" || search.length > 0;

  const resetFilters = () => {
    setStatusFilter("all");
    setYearFilter("all");
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
      // silent fallback
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-full rounded-xl" />
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0 && !isLoading && !hasActiveFilters) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold">
            Aucune commande pour le moment
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Dès votre première commande, vous la retrouverez ici avec toutes
            les informations : suivi, facture, détails de livraison.
          </p>
          <Button asChild className="mt-2">
            <Link href="/products">
              Parcourir le catalogue
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-4 md:p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Filter className="h-3.5 w-3.5" aria-hidden="true" />
          Rechercher et filtrer
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="order-search" className="sr-only">
              Rechercher
            </Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="order-search"
                type="search"
                placeholder="Numéro, produit, date…"
                value={rawSearch}
                onChange={(e) => setRawSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="order-status" className="sr-only">
              Statut
            </Label>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger id="order-status" className="min-w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="order-year" className="sr-only">
              Année
            </Label>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger id="order-year" className="min-w-[140px]">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les années</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <p className="text-xs text-muted-foreground">
              {filteredOrders.length} résultat
              {filteredOrders.length > 1 ? "s" : ""} trouvé
              {filteredOrders.length > 1 ? "s" : ""}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={resetFilters}
            >
              <X className="mr-1 h-3 w-3" aria-hidden="true" />
              Réinitialiser
            </Button>
          </div>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <PackageX className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold">Aucun résultat</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Aucune commande ne correspond à vos filtres. Essayez de modifier
              vos critères ou de réinitialiser la recherche.
            </p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedByYear.map(([year, yearOrders]) => (
            <section key={year} className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {year}
                </h2>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  {yearOrders.length} commande{yearOrders.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-3">
                {yearOrders.map((order) => {
                  const statusCfg = STATUS_CONFIG[order.status];
                  const itemCount = order.items.reduce(
                    (acc, item) => acc + item.quantity,
                    0
                  );
                  const firstItem = order.items[0];
                  const firstImage = firstItem?.product?.images?.[0];

                  return (
                    <Card
                      key={order.id}
                      className="overflow-hidden transition-colors hover:border-primary/40"
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:gap-6">
                          <div className="flex flex-1 items-center gap-4 min-w-0">
                            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                              {firstImage ? (
                                <Image
                                  src={firstImage}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              ) : (
                                <Package
                                  className="h-6 w-6 text-muted-foreground"
                                  aria-hidden="true"
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs font-semibold tracking-tight text-primary">
                                  {order.orderNumber}
                                </p>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "border font-medium",
                                    statusCfg.className
                                  )}
                                >
                                  {statusCfg.label}
                                </Badge>
                              </div>
                              <p className="mt-1 truncate text-sm font-medium">
                                {firstItem
                                  ? firstItem.name
                                  : "Commande sans article"}
                                {itemCount > 1 && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    · +{itemCount - 1} autre
                                    {itemCount > 2 ? "s" : ""}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Passée le {formatDate(order.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 border-t pt-4 md:border-t-0 md:pt-0">
                            <div className="md:text-right">
                              <p className="text-xs text-muted-foreground">
                                Total TTC
                              </p>
                              <p className="text-lg font-bold tracking-tight">
                                {formatCurrency(order.total)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {order.invoice && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDownloadInvoice(order.invoice!.id)
                                  }
                                  className="h-9"
                                  title="Télécharger la facture"
                                >
                                  <Download
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                  <span className="sr-only md:not-sr-only md:ml-1.5">
                                    Facture
                                  </span>
                                </Button>
                              )}
                              <Button
                                asChild
                                size="sm"
                                className="h-9"
                              >
                                <Link href={`/orders/${order.id}`}>
                                  Détail
                                  <ArrowRight
                                    className="ml-1.5 h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-5">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} sur {pagination.totalPages} ·{" "}
            {pagination.total} commande{pagination.total > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only md:not-sr-only md:ml-1">Précédent</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              <span className="sr-only md:not-sr-only md:mr-1">Suivant</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {filteredOrders.length} commandes affichées
      </p>
      <Receipt className="sr-only" aria-hidden="true" />
    </div>
  );
}
