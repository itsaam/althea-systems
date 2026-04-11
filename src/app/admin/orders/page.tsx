"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableToolbar } from "@/components/admin/data-table/data-table-toolbar";
import { getOrdersColumns, type OrderRow } from "@/components/admin/orders/orders-columns";
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

export default function AdminOrdersPage() {
  const router = useRouter();

  // States
  const [orders, setOrders] = useState<OrderRow[]>([]);
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

  // Fetch orders quand les dépendances changent
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
      });

      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      if (sorting.length > 0) {
        params.append("sortBy", sorting[0].id);
        params.append("sortOrder", sorting[0].desc ? "desc" : "asc");
      }

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const res = await fetch(`/api/orders?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Erreur lors du chargement des commandes");
      }

      const data = await res.json();

      setOrders(data.orders);
      setPageCount(data.pagination.totalPages);
    } catch {
      // Silent fallback — DB unavailable in dev backdoor mode
      setOrders([]);
      setPageCount(0);
      signalDegradedMode();
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleView = useCallback(
    (id: string) => {
      router.push(`/admin/orders/${id}`);
    },
    [router]
  );

  const handleStatusChange = useCallback(
    async (id: string, status: string) => {
      try {
        const res = await fetch(`/api/orders/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erreur lors de la mise à jour");
        }

        toast.success("Statut de la commande mis à jour");
        fetchOrders();
      } catch (error) {
        console.error("Erreur mise à jour statut:", error);
        toast.error(
          error instanceof Error ? error.message : "Erreur lors de la mise à jour du statut"
        );
      }
    },
    [fetchOrders]
  );

  const handlePaginationChange = useCallback((newPagination: PaginationState) => {
    setPagination(newPagination);
  }, []);

  const handleSortingChange = useCallback((newSorting: SortingState) => {
    setSorting(newSorting);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchValue("");
    setDebouncedSearch("");
    setStatusFilter("all");
  }, []);

  // Définition des colonnes
  const columns = getOrdersColumns({
    onView: handleView,
    onStatusChange: handleStatusChange,
  });

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Admin — Commerce"
        index="003 / Commandes"
        title="Commandes"
        description="Suivez l'état des commandes, leur préparation et leur livraison."
        actions={
          <ExportButton
            endpoint="/api/admin/orders/export"
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
                <SelectItem value="CONFIRMED">Confirmée</SelectItem>
                <SelectItem value="PROCESSING">En préparation</SelectItem>
                <SelectItem value="SHIPPED">Expédiée</SelectItem>
                <SelectItem value="DELIVERED">Livrée</SelectItem>
                <SelectItem value="CANCELLED">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={orders}
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
