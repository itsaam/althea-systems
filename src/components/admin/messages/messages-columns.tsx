"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Mail, MailOpen, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";

export interface MessageRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface MessagesColumnsProps {
  onView?: (message: MessageRow) => void;
  onToggleRead?: (id: string, currentRead: boolean) => void;
  onDelete?: (id: string) => void;
}

export const getMessagesColumns = ({ onView, onToggleRead, onDelete }: MessagesColumnsProps = {}): ColumnDef<MessageRow>[] => [
  // Checkbox
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
  // Read status icon
  {
    accessorKey: "read",
    header: "",
    cell: ({ row }) => {
      const read = row.getValue("read") as boolean;
      return read ? (
        <MailOpen className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Mail className="h-4 w-4 text-primary" />
      );
    },
    enableSorting: false,
  },
  // Name
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" />,
    cell: ({ row }) => {
      const read = row.original.read;
      return <div className={read ? "text-muted-foreground" : "font-semibold"}>{row.getValue("name")}</div>;
    },
  },
  // Email
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue("email")}</div>,
    enableSorting: false,
  },
  // Subject
  {
    accessorKey: "subject",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sujet" />,
    cell: ({ row }) => {
      const read = row.original.read;
      return <div className={`max-w-xs truncate ${read ? "text-muted-foreground" : "font-medium"}`}>{row.getValue("subject")}</div>;
    },
  },
  // Date
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {new Date(row.getValue("createdAt")).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    ),
  },
  // Actions
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const message = row.original;
      return (
        <div className="flex gap-2">
          {onView && (
            <Button variant="outline" size="icon" onClick={() => onView(message)} title="Voir">
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onToggleRead && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onToggleRead(message.id, message.read)}
              title={message.read ? "Marquer non lu" : "Marquer lu"}
            >
              {message.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="icon" onClick={() => onDelete(message.id)} title="Supprimer">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
];
