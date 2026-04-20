"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  CreditCard,
  ExternalLink,
  MapPin,
  Package,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const STATUS_FLOW = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payé",
  FAILED: "Échoué",
  REFUNDED: "Remboursé",
};

const STATUS_TONE: Record<
  string,
  { badge: string; dot: string; icon: string }
> = {
  PENDING: {
    badge: "bg-warning/15 text-warning border-warning/30",
    dot: "bg-warning",
    icon: "text-warning",
  },
  CONFIRMED: {
    badge: "bg-primary/10 text-primary border-primary/20",
    dot: "bg-primary",
    icon: "text-primary",
  },
  PROCESSING: {
    badge: "bg-primary/15 text-primary border-primary/30",
    dot: "bg-primary",
    icon: "text-primary",
  },
  SHIPPED: {
    badge: "bg-foreground/10 text-foreground border-foreground/20",
    dot: "bg-foreground/70",
    icon: "text-foreground/80",
  },
  DELIVERED: {
    badge: "bg-success/10 text-success border-success/20",
    dot: "bg-success",
    icon: "text-success",
  },
  CANCELLED: {
    badge: "bg-destructive/10 text-destructive border-destructive/20",
    dot: "bg-destructive",
    icon: "text-destructive",
  },
};

interface OrderAddress {
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  street: string;
  street2?: string | null;
  city: string;
  postalCode: string;
  country: string;
  phone?: string | null;
}

interface OrderItemDetail {
  id: string;
  name: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  } | null;
}

interface OrderStatusHistoryEntry {
  id: string;
  status: string;
  changedBy?: string | null;
  createdAt: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  paymentIntentId?: string | null;
  paymentDate?: string | null;
  subtotal: number | string;
  shippingCost: number | string;
  tax: number | string;
  total: number | string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
  };
  address: OrderAddress;
  items: OrderItemDetail[];
  statusHistory?: OrderStatusHistoryEntry[];
  invoice?: { id: string; invoiceNumber: string } | null;
}

function toNumber(value: number | string | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value);
}

function formatCurrency(value: number | string | null | undefined): string {
  return `${toNumber(value).toFixed(2)} €`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusIcon(status: string) {
  switch (status) {
    case "DELIVERED":
      return CheckCircle2;
    case "CANCELLED":
      return XCircle;
    case "SHIPPED":
      return Truck;
    case "PROCESSING":
      return Package;
    case "CONFIRMED":
      return Clock;
    default:
      return Circle;
  }
}

export function OrderDetailView({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error("Commande introuvable");
      const data = await res.json();
      setOrder(data.order ?? data);
    } catch (error) {
      console.error(error);
      toast.error("Impossible de charger la commande");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusChange = useCallback(
    async (nextStatus: string) => {
      if (!order || order.status === nextStatus) return;
      setIsUpdating(true);
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Erreur lors de la mise à jour");
        }
        toast.success("Statut mis à jour");
        await loadOrder();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erreur lors de la mise à jour"
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [order, orderId, loadOrder]
  );

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/admin/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Retour
        </Button>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              Cette commande n&apos;existe pas ou a été supprimée.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tone = STATUS_TONE[order.status] ?? STATUS_TONE.PENDING;
  const StatusIcon = getStatusIcon(order.status);

  const customerName =
    [order.user.firstName, order.user.lastName].filter(Boolean).join(" ") ||
    "Client sans nom";

  const history = order.statusHistory ?? [];
  const itemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2 h-8 text-muted-foreground"
            onClick={() => router.push("/admin/orders")}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Toutes les commandes
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {order.orderNumber}
            </h1>
            <Badge className={`${tone.badge} border px-2.5 py-1`}>
              <StatusIcon
                className={`mr-1.5 h-3.5 w-3.5 ${tone.icon}`}
                aria-hidden="true"
              />
              {STATUS_LABELS[order.status] ?? order.status}
            </Badge>
          </div>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Créée {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="flex flex-col gap-2 md:items-end">
          <label
            htmlFor="order-status"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Changer le statut
          </label>
          <Select
            value={order.status}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger id="order-status" className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" aria-hidden="true" />
                Articles ({itemsCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {order.items.map((item) => {
                  const lineTotal = toNumber(item.price) * item.quantity;
                  const thumbnail = item.product?.images?.[0];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 px-6 py-4"
                    >
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border bg-muted">
                        {thumbnail ? (
                          <div
                            role="img"
                            aria-label={item.name}
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${thumbnail})` }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Package className="h-5 w-5" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right font-medium tabular-nums">
                        {formatCurrency(lineTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="space-y-2 px-6 py-5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Sous-total</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Livraison</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>TVA</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.tax)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-semibold tabular-nums">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" aria-hidden="true" />
                Historique des statuts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline
                currentStatus={order.status}
                history={history}
                createdAt={order.createdAt}
              />
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" aria-hidden="true" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{customerName}</p>
              <p className="break-all text-muted-foreground">
                {order.user.email}
              </p>
              {order.user.phone && (
                <p className="text-muted-foreground">{order.user.phone}</p>
              )}
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="mt-2 h-8 -ml-2 text-xs"
              >
                <Link href={`/admin/users?search=${encodeURIComponent(order.user.email)}`}>
                  Voir la fiche client
                  <ExternalLink className="ml-1.5 h-3 w-3" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              {(order.address.firstName || order.address.lastName) && (
                <p className="font-medium text-foreground">
                  {[order.address.firstName, order.address.lastName]
                    .filter(Boolean)
                    .join(" ")}
                </p>
              )}
              {order.address.company && <p>{order.address.company}</p>}
              <p>{order.address.street}</p>
              {order.address.street2 && <p>{order.address.street2}</p>}
              <p>
                {order.address.postalCode} {order.address.city}
              </p>
              <p>{order.address.country}</p>
              {order.address.phone && (
                <p className="pt-1">{order.address.phone}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" aria-hidden="true" />
                Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Statut</span>
                <Badge variant="outline" className="font-normal">
                  {PAYMENT_STATUS_LABELS[order.paymentStatus] ??
                    order.paymentStatus}
                </Badge>
              </div>
              {order.paymentMethod && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Méthode</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
              )}
              {order.paymentDate && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payée le</span>
                  <span className="font-medium">
                    {formatDateTime(order.paymentDate)}
                  </span>
                </div>
              )}
              {order.paymentIntentId && (
                <div className="pt-1">
                  <p className="text-xs text-muted-foreground">Réf. Stripe</p>
                  <p className="mt-0.5 break-all font-mono text-xs">
                    {order.paymentIntentId}
                  </p>
                </div>
              )}
              {order.invoice && (
                <>
                  <Separator />
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Link href={`/admin/invoices/${order.invoice.id}`}>
                      Voir la facture {order.invoice.invoiceNumber}
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OrderTimeline({
  currentStatus,
  history,
  createdAt,
}: {
  currentStatus: string;
  history: OrderStatusHistoryEntry[];
  createdAt: string;
}) {
  const isCancelled = currentStatus === "CANCELLED";
  const completedSet = new Set<string>();

  if (history.length > 0) {
    for (const entry of history) {
      completedSet.add(entry.status);
    }
  } else {
    const idx = STATUS_FLOW.indexOf(currentStatus as (typeof STATUS_FLOW)[number]);
    if (idx >= 0) {
      for (let i = 0; i <= idx; i += 1) {
        completedSet.add(STATUS_FLOW[i]);
      }
    }
  }

  const timelineSteps = isCancelled
    ? [
        { status: "PENDING" as const, fallbackDate: createdAt },
        { status: "CANCELLED" as const, fallbackDate: null },
      ]
    : STATUS_FLOW.map((status) => ({
        status,
        fallbackDate: status === "PENDING" ? createdAt : null,
      }));

  const historyByStatus = new Map<string, OrderStatusHistoryEntry>();
  for (const entry of history) {
    const existing = historyByStatus.get(entry.status);
    if (!existing || new Date(entry.createdAt) > new Date(existing.createdAt)) {
      historyByStatus.set(entry.status, entry);
    }
  }

  return (
    <ol className="relative space-y-5">
      <span
        aria-hidden="true"
        className="absolute left-[11px] top-2 bottom-2 w-px bg-border"
      />
      {timelineSteps.map(({ status, fallbackDate }) => {
        const completed = completedSet.has(status) || status === currentStatus;
        const isCurrent = status === currentStatus;
        const tone = STATUS_TONE[status] ?? STATUS_TONE.PENDING;
        const entry = historyByStatus.get(status);
        const date = entry?.createdAt ?? fallbackDate;
        const Icon = getStatusIcon(status);

        return (
          <li
            key={status}
            className="relative flex items-start gap-4 pl-0"
            aria-current={isCurrent ? "step" : undefined}
          >
            <span
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                completed
                  ? `${tone.dot} border-transparent text-white`
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              {completed ? (
                <Icon className="h-3 w-3" aria-hidden="true" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              )}
            </span>
            <div className="flex-1 pb-1">
              <p
                className={`text-sm ${
                  isCurrent
                    ? "font-semibold text-foreground"
                    : completed
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {STATUS_LABELS[status] ?? status}
              </p>
              {date && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDateTime(date)}
                </p>
              )}
              {entry?.changedBy && (
                <p className="text-xs text-muted-foreground">
                  par {entry.changedBy}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
