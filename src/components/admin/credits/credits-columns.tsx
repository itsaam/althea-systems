"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";

export interface CreditNoteRow {
  id: string;
  creditNumber: string;
  orderId: string;
  invoiceId: string | null;
  amount: number;
  reason: "CANCELLATION" | "REFUND" | "ERROR";
  createdAt: string;
  invoice: {
    invoiceNumber: string;
    pdfUrl: string | null;
  } | null;
  order: {
    orderNumber: string;
    user: {
      email: string;
      firstName: string | null;
      lastName: string | null;
    };
  };
}

const reasonLabels: Record<string, string> = {
  CANCELLATION: "Annulation",
  REFUND: "Remboursement",
  ERROR: "Erreur",
};

const reasonVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  CANCELLATION: "destructive",
  REFUND: "secondary",
  ERROR: "outline",
};

interface CreditsColumnsProps {
  onView?: (id: string) => void;
  onDownload?: (id: string) => void;
}

export const getCreditsColumns = ({
  onView,
  onDownload,
}: CreditsColumnsProps = {}): ColumnDef<CreditNoteRow>[] => [
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
    accessorKey: "creditNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="N° Avoir" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("creditNumber")}</div>
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
    id: "client",
    header: "Client",
    cell: ({ row }) => {
      const user = row.original.order.user;
      const name =
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.email;
      return <div className="text-sm">{name}</div>;
    },
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
    accessorKey: "reason",
    header: "Motif",
    cell: ({ row }) => {
      const reason = row.getValue("reason") as string;
      return (
        <Badge variant={reasonVariants[reason] || "secondary"}>
          {reasonLabels[reason] || reason}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    id: "invoiceNumber",
    header: "Facture liée",
    cell: ({ row }) =>
      row.original.invoice ? (
        <div className="text-sm text-muted-foreground">
          {row.original.invoice.invoiceNumber}
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
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
      const credit = row.original;
      return (
        <div className="flex gap-2">
          {onView && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onView(credit.id)}
              title="Voir"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onDownload && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDownload(credit.id)}
              title="Télécharger"
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
