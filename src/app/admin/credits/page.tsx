"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableToolbar } from "@/components/admin/data-table/data-table-toolbar";
import {
  getCreditsColumns,
  type CreditNoteRow,
} from "@/components/admin/credits/credits-columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExportButton } from "@/components/admin/export-button";

export default function AdminCreditsPage() {
  const router = useRouter();

  // States
  const [creditNotes, setCreditNotes] = useState<CreditNoteRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState("all");

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

  // Fetch credit notes quand les dépendances changent
  const fetchCreditNotes = useCallback(async () => {
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

      if (reasonFilter && reasonFilter !== "all") {
        params.append("reason", reasonFilter);
      }

      const res = await fetch(`/api/credits?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Erreur lors du chargement des avoirs");
      }

      const json = await res.json();
      const responseData = json.data || json;

      // Normalize amounts (Prisma Decimal serialization)
      const normalizedCreditNotes = (responseData.creditNotes || []).map(
        (cn: CreditNoteRow) => ({
          ...cn,
          amount: Number(cn.amount),
        })
      );

      // Client-side search filter on creditNumber
      const filtered = debouncedSearch
        ? normalizedCreditNotes.filter((cn: CreditNoteRow) =>
            cn.creditNumber
              .toLowerCase()
              .includes(debouncedSearch.toLowerCase())
          )
        : normalizedCreditNotes;

      setCreditNotes(filtered);
      setPageCount(responseData.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Erreur chargement avoirs:", error);
      toast.error("Erreur lors du chargement des avoirs");
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    debouncedSearch,
    reasonFilter,
  ]);

  useEffect(() => {
    fetchCreditNotes();
  }, [fetchCreditNotes]);

  // Handlers — credit notes are always attached to an invoice, navigate there
  const handleView = useCallback(
    (id: string) => {
      const credit = creditNotes.find((cn) => cn.id === id);
      if (credit?.invoiceId) {
        router.push(`/admin/invoices/${credit.invoiceId}`);
      } else {
        toast.info("Cet avoir n'est lié à aucune facture");
      }
    },
    [creditNotes, router]
  );

  const handleDownload = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/credits/${id}/download`);

      if (!res.ok) {
        throw new Error("Erreur lors du téléchargement");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `avoir-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Document téléchargé avec succès");
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      toast.error("Erreur lors du téléchargement");
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
    setReasonFilter("all");
  }, []);

  // Columns
  const columns = getCreditsColumns({
    onView: handleView,
    onDownload: handleDownload,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Avoirs</h1>
        <ExportButton
          endpoint="/api/admin/credits/export"
          queryParams={reasonFilter !== "all" ? { reason: reasonFilter } : {}}
        />
      </div>

      {/* Toolbar avec recherche et filtre motif */}
      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onResetFilters={handleResetFilters}
        filters={
          <div className="flex items-center gap-2">
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="Filtrer par motif" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les motifs</SelectItem>
                <SelectItem value="CANCELLATION">Annulation</SelectItem>
                <SelectItem value="REFUND">Remboursement</SelectItem>
                <SelectItem value="ERROR">Erreur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={creditNotes}
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
