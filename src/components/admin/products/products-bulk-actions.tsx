"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Trash2, Edit, FolderTree } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

interface ProductsBulkActionsProps {
  selectedIds: string[];
  onActionComplete: () => void;
}

export function ProductsBulkActions({
  selectedIds,
  onActionComplete,
}: ProductsBulkActionsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Récupération des catégories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Erreur chargement catégories:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleBulkDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Produits supprimés avec succès");
        setIsDeleteDialogOpen(false);
        onActionComplete();
      } else {
        toast.error(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression bulk:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!selectedStatus) {
      toast.error("Veuillez sélectionner un statut");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          action: "status",
          value: selectedStatus,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Statut modifié avec succès");
        setIsStatusDialogOpen(false);
        setSelectedStatus("");
        onActionComplete();
      } else {
        toast.error(data.error || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("Erreur modification statut bulk:", error);
      toast.error("Erreur lors de la modification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkCategoryUpdate = async () => {
    if (!selectedCategory) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          action: "category",
          value: selectedCategory,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Catégorie modifiée avec succès");
        setIsCategoryDialogOpen(false);
        setSelectedCategory("");
        onActionComplete();
      } else {
        toast.error(data.error || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("Erreur modification catégorie bulk:", error);
      toast.error("Erreur lors de la modification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "excel") => {
    try {
      toast.info(`Export ${format.toUpperCase()} en cours...`);

      const res = await fetch(`/api/admin/products/export?format=${format}`);

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `produits_${new Date().toISOString().split("T")[0]}.${
          format === "excel" ? "xlsx" : "csv"
        }`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("Export réussi");
      } else {
        toast.error("Erreur lors de l'export");
      }
    } catch (error) {
      console.error("Erreur export:", error);
      toast.error("Erreur lors de l'export");
    }
  };

  const isDisabled = selectedIds.length === 0;

  return (
    <div className="flex items-center gap-2 rounded-lg border p-4">
      <div className="flex-1">
        <p className="text-sm font-medium">
          {selectedIds.length} produit(s) sélectionné(s)
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isDisabled}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsStatusDialogOpen(true)}
          disabled={isDisabled}
        >
          <Edit className="mr-2 h-4 w-4" />
          Modifier statut
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCategoryDialogOpen(true)}
          disabled={isDisabled}
        >
          <FolderTree className="mr-2 h-4 w-4" />
          Modifier catégorie
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExport("csv")}>
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("excel")}>
              Export Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Modale de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedIds.length} produit(s) ? Cette
              action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isLoading}
            >
              {isLoading ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale de modification de statut */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le statut</DialogTitle>
            <DialogDescription>
              Sélectionnez le nouveau statut pour {selectedIds.length} produit(s).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Brouillon</SelectItem>
                <SelectItem value="PUBLISHED">Publié</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsStatusDialogOpen(false);
                setSelectedStatus("");
              }}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button onClick={handleBulkStatusUpdate} disabled={isLoading}>
              {isLoading ? "Modification..." : "Modifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale de modification de catégorie */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
            <DialogDescription>
              Sélectionnez la nouvelle catégorie pour {selectedIds.length} produit(s).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCategoryDialogOpen(false);
                setSelectedCategory("");
              }}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button onClick={handleBulkCategoryUpdate} disabled={isLoading}>
              {isLoading ? "Modification..." : "Modifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
