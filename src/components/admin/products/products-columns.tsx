"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { calculateTTC } from "@/lib/utils/tva";

import type { ProductWithCategory } from "@/types/admin-table";

interface ProductsColumnsProps {
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// Classes partagées — bouton outline neutre, zéro couleur primaire.
const ICON_BTN_CLASS =
  "inline-flex h-8 w-8 items-center justify-center rounded-none border border-border/60 bg-background text-foreground/70 transition-colors hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const ICON_BTN_DANGER_CLASS =
  "inline-flex h-8 w-8 items-center justify-center rounded-none border border-border/60 bg-background text-foreground/70 transition-colors hover:border-destructive hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const CHIP_CLASS =
  "inline-flex items-center rounded-none border border-border/60 bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/70";

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
          className="h-12 w-12 rounded-none border border-border/60 object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-none border border-dashed border-border/60 bg-foreground/[0.02]">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-foreground/40">
            N/A
          </span>
        </div>
      );
    },
    enableSorting: false,
  },

  // Colonne nom (triable)
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const sku = row.original.sku;
      return (
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-foreground">
            {name}
          </div>
          {sku && (
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
              {sku}
            </div>
          )}
        </div>
      );
    },
  },

  // Colonne catégorie
  {
    accessorKey: "category",
    header: "Catégorie",
    cell: ({ row }) => {
      const cat = row.getValue("category") as { name: string } | null;
      return cat ? (
        <span className={CHIP_CLASS}>{cat.name}</span>
      ) : (
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/30">
          —
        </span>
      );
    },
    enableSorting: false,
  },

  // Colonne Prix TTC (calculé, triable) — TTC direct, HT en sous-ligne
  {
    id: "priceTTC",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prix TTC" />
    ),
    accessorFn: (row) => calculateTTC(row.price, row.tva),
    cell: ({ row }) => {
      const ttc = calculateTTC(row.original.price, row.original.tva);
      const ht = row.original.price;
      return (
        <div className="text-right tabular-nums">
          <div className="font-mono text-[13px] text-foreground">
            {ttc.toFixed(2)} €
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
            HT · {ht.toFixed(2)}
          </div>
        </div>
      );
    },
  },

  // Colonne Stock (triable) — chip neutre, rouge uniquement sous seuil
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      const low = stock < 5;
      return (
        <span
          className={
            low
              ? "inline-flex items-center gap-1.5 rounded-none border border-destructive/60 bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-destructive"
              : "inline-flex items-center gap-1.5 rounded-none border border-border/60 bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-foreground/70"
          }
        >
          <span
            aria-hidden
            className={
              low
                ? "h-1 w-1 rounded-full bg-destructive"
                : "h-1 w-1 rounded-full bg-foreground/40"
            }
          />
          {stock}
        </span>
      );
    },
  },

  // Colonne Statut (triable) — plus aucune couleur primaire
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const published = status === "PUBLISHED";
      return (
        <span
          className={
            published
              ? "inline-flex items-center gap-1.5 rounded-none border border-foreground/80 bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground"
              : "inline-flex items-center gap-1.5 rounded-none border border-dashed border-border/60 bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50"
          }
        >
          <span
            aria-hidden
            className={
              published
                ? "h-1 w-1 rounded-full bg-foreground"
                : "h-1 w-1 rounded-full bg-foreground/30"
            }
          />
          {published ? "Publié" : "Brouillon"}
        </span>
      );
    },
  },

  // Colonne Actions — 3 boutons outline neutres
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-1.5">
          {onView && (
            <button
              type="button"
              className={ICON_BTN_CLASS}
              onClick={() => onView(product.id)}
              title="Voir"
              aria-label="Voir"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              className={ICON_BTN_CLASS}
              onClick={() => onEdit(product.id)}
              title="Éditer"
              aria-label="Éditer"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className={ICON_BTN_DANGER_CLASS}
              onClick={() => onDelete(product.id)}
              title="Supprimer"
              aria-label="Supprimer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
];
