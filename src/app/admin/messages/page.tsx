"use client";

import { useCallback, useEffect, useState } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableToolbar } from "@/components/admin/data-table/data-table-toolbar";
import { getMessagesColumns, type MessageRow } from "@/components/admin/messages/messages-columns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/admin/export-button";

export default function AdminMessagesPage() {
  // Data state
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Search state
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Filter state
  const [readFilter, setReadFilter] = useState<string>("all");

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [pageCount, setPageCount] = useState(0);

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Dialog state
  const [viewingMessage, setViewingMessage] = useState<MessageRow | null>(null);

  // Debounce search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Reset page on filter change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [readFilter]);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
      });

      if (readFilter === "read") {
        params.append("read", "true");
      } else if (readFilter === "unread") {
        params.append("read", "false");
      }

      const res = await fetch(`/api/contact?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Erreur lors du chargement des messages");
      }

      const json = await res.json();
      const responseData = json.data || json;

      setMessages(responseData.messages || []);
      setPageCount(responseData.pagination?.totalPages || 0);
    } catch (error) {
      console.error("Erreur chargement messages:", error);
      toast.error("Erreur lors du chargement des messages");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, readFilter]);

  // Fetch unread count separately
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/contact?read=false&page=1&limit=1");
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setUnreadCount(responseData.pagination?.total || 0);
      }
    } catch {
      // Silently fail for unread count
    }
  }, []);

  // Fetch messages when dependencies change
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Fetch unread count on mount and after mutations
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Client-side search filtering
  const filteredMessages = debouncedSearch
    ? messages.filter((m) => {
        const search = debouncedSearch.toLowerCase();
        return (
          m.name.toLowerCase().includes(search) ||
          m.email.toLowerCase().includes(search) ||
          m.subject.toLowerCase().includes(search)
        );
      })
    : messages;

  const toggleReadStatus = async (id: string, currentRead: boolean) => {
    try {
      const res = await fetch(`/api/contact/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: !currentRead }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      toast.success(currentRead ? "Message marqué comme non lu" : "Message marqué comme lu");
      fetchMessages();
      fetchUnreadCount();
    } catch (error) {
      console.error("Erreur toggle read:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleView = (message: MessageRow) => {
    setViewingMessage(message);

    // Auto-mark as read when viewing
    if (!message.read) {
      toggleReadStatus(message.id, false);
    }
  };

  const handlePaginationChange = useCallback((newPagination: PaginationState) => {
    setPagination(newPagination);
  }, []);

  const handleSortingChange = useCallback((newSorting: SortingState) => {
    setSorting(newSorting);
  }, []);

  const handleResetFilters = () => {
    setSearchValue("");
    setDebouncedSearch("");
    setReadFilter("all");
  };

  const columns = getMessagesColumns({
    onView: handleView,
    onToggleRead: toggleReadStatus,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Messages{" "}
          {unreadCount > 0 && (
            <span className="text-lg font-normal text-muted-foreground">
              ({unreadCount} non lu{unreadCount > 1 ? "s" : ""})
            </span>
          )}
        </h1>
        <ExportButton
          endpoint="/api/admin/messages/export"
          queryParams={readFilter !== "all" ? { read: readFilter === "read" ? "true" : "false" } : {}}
        />
      </div>

      {/* Toolbar with search and filter */}
      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onResetFilters={handleResetFilters}
        filters={
          <div className="flex items-center gap-2">
            <Select value={readFilter} onValueChange={setReadFilter}>
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="unread">Non lus</SelectItem>
                <SelectItem value="read">Lus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredMessages}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        isLoading={isLoading}
        pageCount={pageCount}
      />

      {/* View Message Dialog */}
      <Dialog open={!!viewingMessage} onOpenChange={(open) => !open && setViewingMessage(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Détail du message</DialogTitle>
          </DialogHeader>
          {viewingMessage && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{viewingMessage.name}</p>
                  <p className="text-sm text-muted-foreground">{viewingMessage.email}</p>
                </div>
                <Badge variant={viewingMessage.read ? "secondary" : "default"}>
                  {viewingMessage.read ? "Lu" : "Non lu"}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Sujet</p>
                <p className="font-semibold">{viewingMessage.subject}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Message</p>
                <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                  {viewingMessage.message}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-sm">
                  {new Date(viewingMessage.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
