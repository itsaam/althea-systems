"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";

export interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  orderId: string;
  userId: string;
  amount: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  pdfUrl: string | null;
  createdAt: string;
  order: {
    orderNumber: string;
    status: string;
    paymentStatus: string;
  };
  creditNotes: Array<{
    id: string;
    creditNumber: string;
    amount: number;
    reason: string;
  }>;
}

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  CANCELLED: "Annulée",
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  PAID: "default",
  CANCELLED: "destructive",
};

interface InvoicesColumnsProps {
  onView?: (id: string) => void;
  onDownload?: (id: string) => void;
}

export const getInvoicesColumns = ({
  onView,
  onDownload,
}: InvoicesColumnsProps = {}): ColumnDef<InvoiceRow>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tout sélectionner"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Sélectionner"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="N° Facture" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("invoiceNumber")}</div>
    ),
  },
  {
    id: "orderNumber",
    header: "N° Commande",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.original.order.orderNumber}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Montant" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      return (
        <div className="font-medium">
          {typeof amount === "number"
            ? amount.toFixed(2)
            : Number(amount).toFixed(2)}{" "}
          &euro;
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={statusVariants[status] || "secondary"}>
          {statusLabels[status] || status}
        </Badge>
      );
    },
  },
  {
    id: "creditNotes",
    header: "Avoirs",
    cell: ({ row }) => {
      const count = row.original.creditNotes.length;
      return count > 0 ? (
        <Badge variant="outline">{count} avoir(s)</Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {new Date(row.getValue("createdAt")).toLocaleDateString("fr-FR")}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const invoice = row.original;
      return (
        <div className="flex gap-2">
          {onView && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onView(invoice.id)}
              title="Voir"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onDownload && invoice.pdfUrl && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDownload(invoice.id)}
              title="Télécharger PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
];
