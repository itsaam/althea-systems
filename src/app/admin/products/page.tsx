"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableToolbar } from "@/components/admin/data-table/data-table-toolbar";
import { getProductsColumns } from "@/components/admin/products/products-columns";
import { ProductsTableFilters } from "@/components/admin/products/products-table-filters";
import { ProductsBulkActions } from "@/components/admin/products/products-bulk-actions";
import { ClientExportButton } from "@/components/admin/client-export-button";
import type { CsvColumn } from "@/lib/csv-export";

import type { ProductWithCategory, ProductFilters, ProductsResponse } from "@/types/admin-table";

const PRODUCT_EXPORT_COLUMNS: CsvColumn<ProductWithCategory>[] = [
  { header: "Nom", accessor: (p) => p.name },
  { header: "SKU", accessor: (p) => p.sku ?? "" },
  { header: "Slug", accessor: (p) => p.slug },
  { header: "Catégorie", accessor: (p) => p.category?.name ?? "" },
  { header: "Prix", accessor: (p) => Number(p.price).toFixed(2) },
  {
    header: "Prix barré",
    accessor: (p) =>
      p.comparePrice !== null ? Number(p.comparePrice).toFixed(2) : "",
  },
  { header: "TVA", accessor: (p) => p.tva },
  { header: "Stock", accessor: (p) => p.stock },
  { header: "Statut", accessor: (p) => p.status },
  { header: "Mis en avant", accessor: (p) => p.featured },
  {
    header: "Créé le",
    accessor: (p) => new Date(p.createdAt),
  },
];

export default function AdminProductsPage() {
  const router = useRouter();

  // States
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [pageCount, setPageCount] = useState(0);

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Filters state
  const [filters, setFilters] = useState<ProductFilters>({});

  // Debounce recherche (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Fetch products quand les dépendances changent
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize, sorting, debouncedSearch, filters]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Construction des query params
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
      });

      // Recherche
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      // Tri
      if (sorting.length > 0) {
        params.append("sortBy", sorting[0].id);
        params.append("sortOrder", sorting[0].desc ? "desc" : "asc");
      }

      // Filtres
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        params.append("categoryIds", filters.categoryIds.join(","));
      }
      if (filters.minPrice !== undefined) {
        params.append("minPrice", filters.minPrice.toString());
      }
      if (filters.maxPrice !== undefined) {
        params.append("maxPrice", filters.maxPrice.toString());
      }
      if (filters.inStock !== undefined) {
        params.append("inStock", filters.inStock.toString());
      }
      if (filters.status) {
        params.append("status", filters.status);
      }
      if (filters.startDate) {
        params.append("startDate", filters.startDate);
      }
      if (filters.endDate) {
        params.append("endDate", filters.endDate);
      }

      const res = await fetch(`/api/admin/products?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Erreur lors du chargement des produits");
      }

      const data: ProductsResponse = await res.json();

      setProducts(data.products);
      setPageCount(data.pagination.totalPages);
    } catch (error) {
      console.error("Erreur chargement produits:", error);
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (id: string) => {
    router.push(`/admin/products/${id}/view`);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/products/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/bulk`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Produit supprimé avec succès");
        fetchProducts();
      } else {
        toast.error(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handlePaginationChange = useCallback((newPagination: PaginationState) => {
    setPagination(newPagination);
  }, []);

  const handleSortingChange = useCallback((newSorting: SortingState) => {
    setSorting(newSorting);
  }, []);

  const handleRowSelectionChange = useCallback((newSelectedIds: string[]) => {
    setSelectedIds(newSelectedIds);
  }, []);

  const handleResetFilters = () => {
    setSearchValue("");
    setDebouncedSearch("");
    setFilters({});
  };

  // Définition des colonnes
  const columns = getProductsColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Produits</h1>
        <div className="flex items-center gap-2">
          <ClientExportButton
            rows={products}
            columns={PRODUCT_EXPORT_COLUMNS}
            filename="produits"
          />
          <Button onClick={() => router.push("/admin/products/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau produit
          </Button>
        </div>
      </div>

      {/* Toolbar avec recherche */}
      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onResetFilters={handleResetFilters}
        filters={<ProductsTableFilters filters={filters} onFiltersChange={setFilters} />}
      />

      {/* Actions groupées */}
      {selectedIds.length > 0 && (
        <ProductsBulkActions selectedIds={selectedIds} onActionComplete={fetchProducts} />
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={products}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        onRowSelectionChange={handleRowSelectionChange}
        isLoading={isLoading}
        pageCount={pageCount}
      />
    </div>
  );
}
