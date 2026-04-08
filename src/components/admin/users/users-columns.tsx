"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Trash2, Shield, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";

export interface UserRow {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: "USER" | "ADMIN";
  status: "PENDING" | "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  ACTIVE: "default",
  INACTIVE: "destructive",
};

interface UsersColumnsProps {
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleRole?: (id: string, currentRole: string) => void;
}

export const getUsersColumns = ({
  onView,
  onEdit,
  onDelete,
  onToggleRole,
}: UsersColumnsProps = {}): ColumnDef<UserRow>[] => [
  // Checkbox select
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
  // Email (sortable)
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("email")}</div>
    ),
  },
  // Name
  {
    id: "name",
    header: "Nom",
    cell: ({ row }) => {
      const { firstName, lastName } = row.original;
      const name = [firstName, lastName].filter(Boolean).join(" ") || "-";
      return <div>{name}</div>;
    },
    enableSorting: false,
  },
  // Phone
  {
    accessorKey: "phone",
    header: "Téléphone",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.getValue("phone") || "-"}
      </div>
    ),
    enableSorting: false,
  },
  // Role (badge)
  {
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant={role === "ADMIN" ? "default" : "secondary"}>
          {role === "ADMIN" ? "Admin" : "Utilisateur"}
        </Badge>
      );
    },
    enableSorting: false,
  },
  // Status (badge)
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={statusVariants[status] || "secondary"}>
          {statusLabels[status] || status}
        </Badge>
      );
    },
    enableSorting: false,
  },
  // Created at (sortable)
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Inscription" />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {new Date(row.getValue("createdAt")).toLocaleDateString("fr-FR")}
      </div>
    ),
  },
  // Actions
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex gap-2">
          {onView && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onView(user.id)}
              title="Voir"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onToggleRole && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onToggleRole(user.id, user.role)}
              title={
                user.role === "ADMIN" ? "Rétrograder" : "Promouvoir admin"
              }
            >
              {user.role === "ADMIN" ? (
                <ShieldOff className="h-4 w-4" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(user.id)}
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
];
