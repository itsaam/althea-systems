"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { calculateTTC, formatTVA } from "@/lib/utils/tva";

import type { ProductWithCategory } from "@/types/admin-table";

interface ProductsColumnsProps {
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const getProductsColumns = ({
  onView,
  onEdit,
  onDelete,
}: ProductsColumnsProps = {}): ColumnDef<ProductWithCategory>[] => [
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

  // Colonne image
  {
    accessorKey: "images",
    header: "Image",
    cell: ({ row }) => {
      const images = row.getValue("images") as string[];
      return images[0] ? (
        <img
          src={images[0]}
          alt={row.original.name}
          className="h-12 w-12 rounded object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
          <span className="text-xs text-muted-foreground">N/A</span>
        </div>
      );
    },
    enableSorting: false,
  },

  // Colonne nom (triable)
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },

  // Colonne description (tronquée)
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc = row.getValue("description") as string | null;
      const truncated = desc
        ? desc.length > 100
          ? `${desc.substring(0, 100)}...`
          : desc
        : "-";
      return (
        <div className="max-w-xs truncate text-sm text-muted-foreground" title={desc || undefined}>
          {truncated}
        </div>
      );
    },
    enableSorting: false,
  },

  // Colonne catégorie
  {
    accessorKey: "category",
    header: "Catégorie",
    cell: ({ row }) => {
      const cat = row.getValue("category") as { name: string } | null;
      return cat ? (
        <Badge variant="outline">{cat.name}</Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
    enableSorting: false,
  },

  // Colonne Prix HT (triable)
  {
    accessorKey: "price",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Prix HT" />,
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return <div className="font-medium">{price.toFixed(2)} €</div>;
    },
  },

  // Colonne TVA
  {
    accessorKey: "tva",
    header: "TVA",
    cell: ({ row }) => {
      const tva = row.getValue("tva") as string;
      return <Badge variant="secondary">{formatTVA(tva)}</Badge>;
    },
    enableSorting: false,
  },

  // Colonne Prix TTC (calculé, triable)
  {
    id: "priceTTC",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Prix TTC" />,
    accessorFn: (row) => calculateTTC(row.price, row.tva),
    cell: ({ row }) => {
      const ttc = calculateTTC(row.original.price, row.original.tva);
      return <div className="font-medium">{ttc.toFixed(2)} €</div>;
    },
  },

  // Colonne Stock (triable)
  {
    accessorKey: "stock",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      return (
        <Badge variant={stock < 5 ? "destructive" : "default"}>{stock}</Badge>
      );
    },
  },

  // Colonne Statut (triable)
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "PUBLISHED" ? "default" : "secondary"}>
          {status === "PUBLISHED" ? "Publié" : "Brouillon"}
        </Badge>
      );
    },
  },

  // Colonne Date création (triable)
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date création" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString("fr-FR")}
        </div>
      );
    },
  },

  // Colonne Actions
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex gap-2">
          {onView && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onView(product.id)}
              title="Voir"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(product.id)}
              title="Éditer"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(product.id)}
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
