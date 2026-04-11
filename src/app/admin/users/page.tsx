"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableToolbar } from "@/components/admin/data-table/data-table-toolbar";
import {
  getUsersColumns,
  type UserRow,
} from "@/components/admin/users/users-columns";
import { ExportButton } from "@/components/admin/export-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPageHeader } from "@/components/admin/shell/page-header";
import { signalDegradedMode } from "@/lib/admin/mock-data";

export default function AdminUsersPage() {
  const router = useRouter();

  // Data state
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search state
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
    } catch {
      // Silent fallback — DB unavailable in dev backdoor mode
      setUsers([]);
      setPageCount(0);
      signalDegradedMode();
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Client-side filter on email/name + role + status since API doesn't support it
  const filteredUsers = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return users.filter((user) => {
      if (query) {
        const fullName = [user.firstName, user.lastName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (
          !user.email.toLowerCase().includes(query) &&
          !fullName.includes(query)
        ) {
          return false;
        }
      }
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (statusFilter !== "all" && user.status !== statusFilter) return false;
      return true;
    });
  }, [users, debouncedSearch, roleFilter, statusFilter]);

  // Handlers
  const handleView = useCallback(
    (id: string) => {
      router.push(`/admin/users/${id}`);
    },
    [router]
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
    setRoleFilter("all");
    setStatusFilter("all");
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
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Admin — Audience"
        index="004 / Utilisateurs"
        title="Utilisateurs"
        description="Gérez les comptes, leurs rôles et leur statut d'accès au back office."
        actions={<ExportButton endpoint="/api/admin/users/export" />}
      />

      {/* Toolbar with search + filters */}
      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onResetFilters={handleResetFilters}
        filters={
          <div className="flex items-center gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-8 w-[160px]">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="USER">Utilisateur</SelectItem>
                <SelectItem value="ADMIN">Administrateur</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ACTIVE">Actif</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="INACTIVE">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
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
