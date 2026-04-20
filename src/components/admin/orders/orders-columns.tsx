"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  items: Array<{ id: string; name: string; quantity: number; price: number }>;
}

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payé",
  FAILED: "Échoué",
  REFUNDED: "Remboursé",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  PROCESSING: "default",
  SHIPPED: "outline",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

const paymentStatusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  PAID: "default",
  FAILED: "destructive",
  REFUNDED: "outline",
};

function getStatusClassName(status: string): string | undefined {
  if (status === "PROCESSING") return "bg-primary text-primary-foreground hover:bg-primary/90";
  if (status === "DELIVERED") return "bg-success text-success-foreground hover:bg-success/90";
  return undefined;
}

export const getOrdersColumns = ({
  onView,
  onStatusChange,
}: {
  onView?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}): ColumnDef<OrderRow>[] => [
  // Colonne checkbox select
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
        aria-label="Sélectionner la ligne"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // Colonne numéro de commande (triable)
  {
    accessorKey: "orderNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="N° Commande" />,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("orderNumber")}</div>
    ),
  },

  // Colonne client
  {
    id: "client",
    header: "Client",
    accessorFn: (row) => row.user.email,
    cell: ({ row }) => {
      const user = row.original.user;
      const displayName =
        user.firstName || user.lastName
          ? [user.firstName, user.lastName].filter(Boolean).join(" ")
          : null;
      return (
        <div>
          {displayName && <div className="font-medium">{displayName}</div>}
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      );
    },
    enableSorting: false,
  },

  // Colonne total (triable)
  {
    accessorKey: "total",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
    cell: ({ row }) => {
      const total = row.getValue("total") as number;
      return <div className="font-medium">{total.toFixed(2)} &euro;</div>;
    },
  },

  // Colonne statut (triable)
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={statusVariants[status] || "secondary"}
          className={getStatusClassName(status)}
        >
          {statusLabels[status] || status}
        </Badge>
      );
    },
  },

  // Colonne statut paiement
  {
    accessorKey: "paymentStatus",
    header: "Paiement",
    cell: ({ row }) => {
      const paymentStatus = row.getValue("paymentStatus") as string;
      return (
        <Badge variant={paymentStatusVariants[paymentStatus] || "secondary"}>
          {paymentStatusLabels[paymentStatus] || paymentStatus}
        </Badge>
      );
    },
    enableSorting: false,
  },

  // Colonne date (triable)
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString("fr-FR")}
        </div>
      );
    },
  },

  // Colonne actions
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {onView && (
              <DropdownMenuItem onClick={() => onView(order.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
            )}
            {onStatusChange && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Changer le statut</DropdownMenuLabel>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => onStatusChange(order.id, key)}
                    disabled={order.status === key}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
