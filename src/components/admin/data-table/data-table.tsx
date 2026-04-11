"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type PaginationState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  onRowSelectionChange?: (selectedIds: string[]) => void;
  isLoading?: boolean;
  pageCount?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination: controlledPagination,
  onPaginationChange,
  sorting: controlledSorting,
  onSortingChange,
  onRowSelectionChange,
  isLoading = false,
  pageCount,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>(controlledSorting || []);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    controlledPagination || { pageIndex: 0, pageSize: 25 }
  );

  // Utiliser controlled ou internal state
  const sorting = controlledSorting !== undefined ? controlledSorting : internalSorting;
  const pagination =
    controlledPagination !== undefined ? controlledPagination : internalPagination;

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater;
      if (onSortingChange) {
        onSortingChange(newSorting);
      } else {
        setInternalSorting(newSorting);
      }
    },
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);

      // Extraire les IDs sélectionnés
      // Les clés sont déjà les IDs car nous avons défini getRowId
      if (onRowSelectionChange) {
        const selectedIds = Object.keys(newSelection).filter((key) => newSelection[key]);
        onRowSelectionChange(selectedIds);
      }
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === "function" ? updater(pagination) : updater;
      if (onPaginationChange) {
        onPaginationChange(newPagination);
      } else {
        setInternalPagination(newPagination);
      }
    },
    state: {
      sorting,
      rowSelection,
      pagination,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: pageCount,
    enableRowSelection: true,
    getRowId: (row) => (row as { id: string }).id,
  });

  return (
    <div className="space-y-6">
      <div className="border-y border-border/60">
        <Table>
          <TableHeader className="[&_tr]:border-b [&_tr]:border-border/60 [&_th]:h-11 [&_th]:font-mono [&_th]:text-[10px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.18em] [&_th]:text-foreground/55">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="[&_tr]:border-b [&_tr]:border-border/40 [&_tr:last-child]:border-0 [&_tr:hover]:bg-foreground/[0.02] [&_td]:text-[13px]">
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40"
                >
                  Chargement
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40"
                >
                  Aucun résultat
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
