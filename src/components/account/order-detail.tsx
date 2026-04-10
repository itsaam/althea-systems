"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  CreditCard,
  Download,
  MapPin,
  Package,
  Receipt,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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

interface OrderDetail {
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

interface OrderDetailProps {
  orderId: string;
}

export default function OrderDetail({ orderId }: OrderDetailProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
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
      .catch((err) => active && setError(err.message))
      .finally(() => active && setIsLoading(false));
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
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Package className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold">Commande introuvable</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            {error ??
              "Cette commande n'existe pas ou vous n'avez pas accès à ses détails."}
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/orders">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Retour à mes commandes
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status];
  const isCancelled = order.status === "CANCELLED";
  const currentStep = STATUS_TIMELINE.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-8 -ml-2 text-muted-foreground"
        >
          <Link href="/orders">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Retour aux commandes
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-sm font-semibold tracking-tight text-primary">
                  {order.orderNumber}
                </p>
                <Badge
                  variant="outline"
                  className={cn("border font-medium", statusCfg.className)}
                >
                  {statusCfg.label}
                </Badge>
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Commande du {formatDate(order.createdAt)}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.items.length} produit
                {order.items.length > 1 ? "s" : ""} · Total{" "}
                {formatCurrency(order.total)}
              </p>
            </div>
            {order.invoice && (
              <Button
                variant="outline"
                onClick={handleDownloadInvoice}
                className="self-start"
              >
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                Télécharger la facture
              </Button>
            )}
          </div>

          {!isCancelled && (
            <div
              className="mt-6 border-t pt-6"
              aria-label="Suivi de commande"
            >
              <ol className="grid grid-cols-5 gap-2">
                {STATUS_TIMELINE.map((step, index) => {
                  const isActive = index <= currentStep;
                  const isCurrent = index === currentStep;
                  const cfg = STATUS_CONFIG[step];
                  return (
                    <li
                      key={step}
                      className="flex flex-col items-center gap-2 text-center"
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                          isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30 bg-background text-muted-foreground"
                        )}
                        aria-current={isCurrent ? "step" : undefined}
                      >
                        {isActive ? (
                          <CheckCircle2
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        ) : (
                          <Circle className="h-4 w-4" aria-hidden="true" />
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-[11px] font-medium leading-tight",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {cfg.label}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {isCancelled && (
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm">
              <Package
                className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                aria-hidden="true"
              />
              <div>
                <p className="font-medium text-destructive">
                  Commande annulée
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  Cette commande a été annulée. Si vous avez été débité, le
                  remboursement est en cours de traitement.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 md:p-6">
          <h3 className="text-base font-semibold">Articles commandés</h3>
          <ul className="mt-4 divide-y">
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
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    {image ? (
                      <Image
                        src={image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package
                          className="h-5 w-5 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {href ? (
                      <Link
                        href={href}
                        className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium">{item.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="text-right text-sm font-semibold">
                    {formatCurrency(totalLine)}
                  </div>
                </li>
              );
            })}
          </ul>

          <Separator className="my-5" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Sous-total HT</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>TVA</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Livraison</span>
              <span>
                {order.shippingCost === 0
                  ? "Offerte"
                  : formatCurrency(order.shippingCost)}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-base font-bold">
              <span>Total TTC</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-2">
              <MapPin
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              />
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Adresse de livraison
              </h3>
            </div>
            <div className="mt-4 space-y-0.5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {order.address.firstName} {order.address.lastName}
              </p>
              <p>{order.address.street}</p>
              {order.address.street2 && <p>{order.address.street2}</p>}
              <p>
                {order.address.postalCode} {order.address.city}
              </p>
              {order.address.region && <p>{order.address.region}</p>}
              <p className="font-medium text-foreground/80">
                {order.address.country}
              </p>
              {order.address.phone && (
                <p className="pt-2 text-xs">{order.address.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-2">
              <CreditCard
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              />
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Paiement
              </h3>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Statut</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "border font-medium",
                    order.paymentStatus === "PAID"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                      : order.paymentStatus === "REFUNDED"
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-700"
                        : order.paymentStatus === "FAILED"
                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-700"
                  )}
                >
                  {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                </Badge>
              </div>
              {order.paymentMethod && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Méthode</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
              )}
              {order.invoice && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Facture</span>
                  <span className="font-mono text-xs font-semibold">
                    {order.invoice.invoiceNumber}
                  </span>
                </div>
              )}
            </div>
            {order.invoice && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadInvoice}
                className="mt-4 w-full"
              >
                <Receipt className="mr-2 h-4 w-4" aria-hidden="true" />
                Télécharger la facture
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {order.statusHistory && order.statusHistory.length > 0 && (
        <Card>
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Historique du suivi
              </h3>
            </div>
            <ol className="mt-4 space-y-3">
              {order.statusHistory.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start justify-between gap-4 border-l-2 border-primary/30 pl-4"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {STATUS_CONFIG[entry.status].label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {order.notes && (
        <Card>
          <CardContent className="p-5 md:p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Notes
            </h3>
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
              {order.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
