import type { ColumnDef, SortingState, PaginationState } from "@tanstack/react-table";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  onRowSelectionChange?: (selectedIds: string[]) => void;
  isLoading?: boolean;
}

export interface ProductWithCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;  // Déjà sérialisé depuis Decimal
  comparePrice: number | null;
  tva: "TVA_20" | "TVA_10" | "TVA_5_5" | "TVA_0";
  sku: string | null;
  stock: number;
  priority: number;
  images: string[];
  featured: boolean;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string; slug: string } | null;
}

export interface ProductFilters {
  search?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;  // true = stock > 0, false = stock = 0, undefined = tous
  status?: "DRAFT" | "PUBLISHED";
  startDate?: string;
  endDate?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductsResponse {
  products: ProductWithCategory[];
  pagination: PaginationData;
}

export interface BulkActionData {
  ids: string[];
  action: "status" | "category";
  value: string;
}

export interface BulkDeleteData {
  ids: string[];
}
