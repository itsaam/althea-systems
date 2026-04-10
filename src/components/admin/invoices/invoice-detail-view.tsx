"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Receipt,
  ReceiptText,
  ShieldX,
  Undo2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type InvoiceStatus = "PENDING" | "PAID" | "CANCELLED";
type CreditReason = "CANCELLATION" | "REFUND" | "ERROR";

interface InvoiceOrder {
  orderNumber: string;
  total: number | string;
  status: string;
  paymentStatus: string;
}

interface InvoiceCreditNote {
  id: string;
  creditNumber: string;
  amount: number | string;
  reason: CreditReason;
  createdAt: string;
}

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  orderId: string;
  userId: string;
  amount: number | string;
  status: InvoiceStatus;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt?: string;
  order: InvoiceOrder;
  creditNotes: InvoiceCreditNote[];
}

const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  CANCELLED: "Annulée",
};

const INVOICE_STATUS_TONE: Record<
  InvoiceStatus,
  { badge: string; dot: string; icon: typeof CheckCircle2 }
> = {
  PAID: {
    badge:
      "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:text-emerald-400",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  PENDING: {
    badge:
      "bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:text-amber-400",
    dot: "bg-amber-500",
    icon: Clock,
  },
  CANCELLED: {
    badge:
      "bg-red-500/10 text-red-700 ring-1 ring-inset ring-red-600/20 dark:text-red-400",
    dot: "bg-red-500",
    icon: XCircle,
  },
};

const REASON_LABELS: Record<CreditReason, string> = {
  CANCELLATION: "Annulation",
  REFUND: "Remboursement",
  ERROR: "Erreur",
};

const REASON_DESCRIPTIONS: Record<CreditReason, string> = {
  CANCELLATION: "La commande a été annulée par le client ou l'équipe.",
  REFUND: "Un remboursement partiel ou total est accordé au client.",
  ERROR: "Une erreur de facturation est corrigée par cet avoir.",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
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

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

function formatCurrency(value: number | string | null | undefined): string {
  return `${toNumber(value).toFixed(2)} €`;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface InvoiceDetailViewProps {
  invoiceId: string;
}

export function InvoiceDetailView({ invoiceId }: InvoiceDetailViewProps) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);
  const [creditReason, setCreditReason] = useState<CreditReason>("REFUND");
  const [isCreatingCredit, setIsCreatingCredit] = useState(false);

  const fetchInvoice = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`);
      if (!res.ok) throw new Error("Erreur lors du chargement");
      const json = await res.json();
      const data = (json.data?.invoice ?? json.invoice ?? json.data ?? json) as InvoiceDetail;
      setInvoice(data);
    } catch (error) {
      console.error("Erreur chargement facture:", error);
      toast.error("Impossible de charger la facture");
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (!res.ok) throw new Error("Erreur lors du téléchargement");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `facture-${invoice?.invoiceNumber ?? invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("PDF téléchargé");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du téléchargement du PDF");
    } finally {
      setIsDownloading(false);
    }
  }, [invoiceId, invoice?.invoiceNumber]);

  const handleCreateCredit = useCallback(async () => {
    setIsCreatingCredit(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: creditReason }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la création de l'avoir");
      }
      toast.success("Avoir créé et facture annulée");
      setCreditOpen(false);
      await fetchInvoice();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'avoir"
      );
    } finally {
      setIsCreatingCredit(false);
    }
  }, [invoiceId, creditReason, fetchInvoice]);

  if (isLoading) return <InvoiceDetailSkeleton />;

  if (!invoice) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Facture introuvable.</p>
        <Button variant="outline" asChild>
          <Link href="/admin/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
      </div>
    );
  }

  const tone = INVOICE_STATUS_TONE[invoice.status];
  const ToneIcon = tone.icon;
  const hasCreditNotes = invoice.creditNotes.length > 0;
  const canCreateCredit =
    invoice.status !== "CANCELLED" && !hasCreditNotes;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 h-8">
          <Link href="/admin/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux factures
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#003d5c] to-[#00a8b5] text-white shadow-sm"
                aria-hidden="true"
              >
                <ReceiptText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {invoice.invoiceNumber}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${tone.badge}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${tone.dot}`}
                      aria-hidden="true"
                    />
                    <ToneIcon className="h-3 w-3" aria-hidden="true" />
                    {INVOICE_STATUS_LABELS[invoice.status]}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Émise le {formatDate(invoice.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Téléchargement..." : "Télécharger PDF"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setCreditOpen(true)}
              disabled={!canCreateCredit}
              title={
                canCreateCredit
                  ? "Annuler la facture et créer un avoir"
                  : hasCreditNotes
                    ? "Un avoir existe déjà"
                    : "Facture déjà annulée"
              }
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Créer un avoir
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Amount card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Montant facturé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Total TTC
                  </p>
                  <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight">
                    {formatCurrency(invoice.amount)}
                  </p>
                </div>
                {invoice.status === "CANCELLED" && (
                  <div className="flex items-center gap-1.5 rounded-md bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-400">
                    <ShieldX className="h-3.5 w-3.5" />
                    Annulée
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Rattachée à</span>
                <Link
                  href={`/admin/orders/${invoice.orderId}`}
                  className="inline-flex items-center gap-1.5 font-medium underline decoration-muted-foreground/40 underline-offset-4 hover:decoration-foreground"
                >
                  <Receipt className="h-4 w-4" />
                  {invoice.order.orderNumber}
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Statut commande
                  </p>
                  <p className="mt-1">
                    <Badge variant="outline">
                      {ORDER_STATUS_LABELS[invoice.order.status] ||
                        invoice.order.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Paiement
                  </p>
                  <p className="mt-1">
                    <Badge variant="outline">
                      {PAYMENT_STATUS_LABELS[invoice.order.paymentStatus] ||
                        invoice.order.paymentStatus}
                    </Badge>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit notes card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Avoirs liés
                <span className="ml-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {invoice.creditNotes.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!hasCreditNotes ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aucun avoir émis pour cette facture.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {invoice.creditNotes.map((cn) => (
                    <li
                      key={cn.id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                          <Undo2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{cn.creditNumber}</p>
                          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            {formatDate(cn.createdAt)} · {REASON_LABELS[cn.reason]}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium tabular-nums">
                          − {formatCurrency(cn.amount)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    N° Facture
                  </p>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Émise
                  </p>
                  <p>{formatDate(invoice.createdAt)}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Mise à jour
                  </p>
                  <p>{formatDateTime(invoice.updatedAt)}</p>
                </div>
              </div>
              {invoice.pdfUrl && (
                <>
                  <Separator />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      PDF
                    </p>
                    <a
                      href={invoice.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1.5 text-sm underline decoration-muted-foreground/40 underline-offset-4 hover:decoration-foreground"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Ouvrir dans un nouvel onglet
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Credit note creation dialog */}
      <Dialog open={creditOpen} onOpenChange={setCreditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un avoir</DialogTitle>
            <DialogDescription>
              La facture{" "}
              <span className="font-medium text-foreground">
                {invoice.invoiceNumber}
              </span>{" "}
              sera annulée et un avoir du montant de{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(invoice.amount)}
              </span>{" "}
              sera généré. Le PDF sera envoyé au client par email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label
                htmlFor="credit-reason"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                Motif
              </label>
              <Select
                value={creditReason}
                onValueChange={(value) => setCreditReason(value as CreditReason)}
              >
                <SelectTrigger id="credit-reason">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(REASON_LABELS) as CreditReason[]).map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {REASON_LABELS[reason]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {REASON_DESCRIPTIONS[creditReason]}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreditOpen(false)}
              disabled={isCreatingCredit}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleCreateCredit}
              disabled={isCreatingCredit}
            >
              {isCreatingCredit ? "Création..." : "Créer l'avoir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InvoiceDetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-40" />
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    </div>
  );
}
