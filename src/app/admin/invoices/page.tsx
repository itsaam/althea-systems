"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableToolbar } from "@/components/admin/data-table/data-table-toolbar";
import {
  getInvoicesColumns,
  type InvoiceRow,
} from "@/components/admin/invoices/invoices-columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExportButton } from "@/components/admin/export-button";
import { AdminPageHeader } from "@/components/admin/shell/page-header";
import { signalDegradedMode } from "@/lib/admin/mock-data";

export default function AdminInvoicesPage() {
  const router = useRouter();

  // States
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [pageCount, setPageCount] = useState(0);

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Debounce recherche (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Fetch invoices quand les dépendances changent
  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
      });

      if (sorting.length > 0) {
        params.append("sortBy", sorting[0].id);
        params.append("sortOrder", sorting[0].desc ? "desc" : "asc");
      }

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const res = await fetch(`/api/invoices?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Erreur lors du chargement des factures");
      }

      const json = await res.json();
      const responseData = json.data || json;

      // Normalize amounts (Prisma Decimal serialization)
      const normalizedInvoices = (responseData.invoices || []).map(
        (invoice: InvoiceRow) => ({
          ...invoice,
          amount: Number(invoice.amount),
          creditNotes: (invoice.creditNotes || []).map(
            (cn: { amount: number; [key: string]: unknown }) => ({
              ...cn,
              amount: Number(cn.amount),
            })
          ),
        })
      );

      // Client-side search filter on invoiceNumber
      const filtered = debouncedSearch
        ? normalizedInvoices.filter((inv: InvoiceRow) =>
            inv.invoiceNumber
              .toLowerCase()
              .includes(debouncedSearch.toLowerCase())
          )
        : normalizedInvoices;

      setInvoices(filtered);
      setPageCount(responseData.pagination?.totalPages || 1);
    } catch {
      // Silent fallback — DB unavailable in dev backdoor mode
      setInvoices([]);
      setPageCount(0);
      signalDegradedMode();
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    debouncedSearch,
    statusFilter,
  ]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Handlers
  const handleView = useCallback(
    (id: string) => {
      router.push(`/admin/invoices/${id}`);
    },
    [router]
  );

  const handleDownload = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/pdf`);

      if (!res.ok) {
        throw new Error("Erreur lors du téléchargement du PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `facture-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF téléchargé avec succès");
    } catch (error) {
      console.error("Erreur téléchargement PDF:", error);
      toast.error("Erreur lors du téléchargement du PDF");
    }
  }, []);

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setPagination(newPagination);
    },
    []
  );

  const handleSortingChange = useCallback((newSorting: SortingState) => {
    setSorting(newSorting);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchValue("");
    setDebouncedSearch("");
    setStatusFilter("all");
  }, []);

  // Columns
  const columns = getInvoicesColumns({
    onView: handleView,
    onDownload: handleDownload,
  });

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Admin — Commerce"
        index="006 / Factures"
        title="Factures"
        description="Consultez et téléchargez les factures émises — un document par commande payée."
        actions={
          <ExportButton
            endpoint="/api/admin/invoices/export"
            queryParams={statusFilter !== "all" ? { status: statusFilter } : {}}
          />
        }
      />

      {/* Toolbar avec recherche et filtre statut */}
      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onResetFilters={handleResetFilters}
        filters={
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="PAID">Payée</SelectItem>
                <SelectItem value="CANCELLED">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={invoices}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        isLoading={isLoading}
        pageCount={pageCount}
      />
    </div>
  );
}
