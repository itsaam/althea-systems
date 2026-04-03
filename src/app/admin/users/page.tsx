"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableToolbar } from "@/components/admin/data-table/data-table-toolbar";
import {
  getUsersColumns,
  type UserRow,
} from "@/components/admin/users/users-columns";
import { ExportButton } from "@/components/admin/export-button";

export default function AdminUsersPage() {
  // Data state
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search state
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

  // Debounce search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Reset to first page when search changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
      });

      const res = await fetch(`/api/users?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Erreur lors du chargement des utilisateurs");
      }

      const json = await res.json();
      // Handle both wrapped { data: { users, pagination } } and direct { users, pagination }
      const responseData = json.data || json;

      setUsers(responseData.users);
      setPageCount(responseData.pagination.totalPages);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Client-side filter on email/name since API doesn't support search
  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return users;
    const query = debouncedSearch.toLowerCase();
    return users.filter((user) => {
      const fullName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        user.email.toLowerCase().includes(query) || fullName.includes(query)
      );
    });
  }, [users, debouncedSearch]);

  // Handlers
  const handleView = useCallback(
    (id: string) => {
      const user = users.find((u) => u.id === id);
      if (user) {
        const fullName =
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          "Non renseigné";
        toast.info(
          `${user.email} - ${user.role === "ADMIN" ? "Admin" : "Utilisateur"} - ${fullName}`
        );
      }
    },
    [users]
  );

  const handleToggleRole = useCallback(
    async (id: string, currentRole: string) => {
      const user = users.find((u) => u.id === id);
      if (!user) return;

      const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
      const actionLabel =
        newRole === "ADMIN"
          ? "promouvoir administrateur"
          : "rétrograder utilisateur";

      if (!confirm(`Voulez-vous ${actionLabel} "${user.email}" ?`)) {
        return;
      }

      try {
        const res = await fetch(`/api/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(
            data.error || "Erreur lors de la mise à jour du rôle"
          );
        }

        toast.success(
          `${user.email} est maintenant ${newRole === "ADMIN" ? "administrateur" : "utilisateur"}`
        );
        fetchUsers();
      } catch (error) {
        console.error("Erreur changement de rôle:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Erreur lors de la mise à jour du rôle"
        );
      }
    },
    [users, fetchUsers]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const user = users.find((u) => u.id === id);
      if (!user) return;

      if (
        !confirm(
          `Voulez-vous vraiment supprimer l'utilisateur "${user.email}" ? Cette action est irréversible.`
        )
      ) {
        return;
      }

      try {
        const res = await fetch(`/api/users/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(
            data.error || "Erreur lors de la suppression de l'utilisateur"
          );
        }

        toast.success("Utilisateur supprimé avec succès");
        fetchUsers();
      } catch (error) {
        console.error("Erreur suppression:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Erreur lors de la suppression"
        );
      }
    },
    [users, fetchUsers]
  );

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
  }, []);

  // Columns definition
  const columns = useMemo(
    () =>
      getUsersColumns({
        onView: handleView,
        onDelete: handleDelete,
        onToggleRole: handleToggleRole,
      }),
    [handleView, handleDelete, handleToggleRole]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Utilisateurs</h1>
        <ExportButton endpoint="/api/admin/users/export" />
      </div>

      {/* Toolbar with search */}
      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onResetFilters={handleResetFilters}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
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
