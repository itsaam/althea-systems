"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import type { ProductFilters } from "@/types/admin-table";

interface Category {
  id: string;
  name: string;
}

interface ProductsTableFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

export function ProductsTableFilters({
  filters,
  onFiltersChange,
}: ProductsTableFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  // Récupération des catégories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("categories-unavailable");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      // Silent fallback — DB unavailable in dev backdoor mode
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  const handleFilterChange = (key: keyof ProductFilters, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleResetFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filtres</h3>
        <Button variant="ghost" size="sm" onClick={handleResetFilters}>
          Réinitialiser
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Filtre catégorie */}
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Select
            value={filters.categoryIds?.[0] || "all"}
            onValueChange={(value) =>
              handleFilterChange("categoryIds", value === "all" ? undefined : [value])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtre statut */}
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              handleFilterChange("status", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="DRAFT">Brouillon</SelectItem>
              <SelectItem value="PUBLISHED">Publié</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtre prix minimum */}
        <div className="space-y-2">
          <Label>Prix min (€)</Label>
          <Input
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={filters.minPrice || ""}
            onChange={(e) =>
              handleFilterChange(
                "minPrice",
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
          />
        </div>

        {/* Filtre prix maximum */}
        <div className="space-y-2">
          <Label>Prix max (€)</Label>
          <Input
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={filters.maxPrice || ""}
            onChange={(e) =>
              handleFilterChange(
                "maxPrice",
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
          />
        </div>

        {/* Filtre date début */}
        <div className="space-y-2">
          <Label>Date début</Label>
          <Input
            type="date"
            value={filters.startDate ? filters.startDate.split("T")[0] : ""}
            onChange={(e) =>
              handleFilterChange(
                "startDate",
                e.target.value ? new Date(e.target.value).toISOString() : undefined
              )
            }
          />
        </div>

        {/* Filtre date fin */}
        <div className="space-y-2">
          <Label>Date fin</Label>
          <Input
            type="date"
            value={filters.endDate ? filters.endDate.split("T")[0] : ""}
            onChange={(e) =>
              handleFilterChange(
                "endDate",
                e.target.value ? new Date(e.target.value).toISOString() : undefined
              )
            }
          />
        </div>

        {/* Filtre stock */}
        <div className="space-y-2">
          <Label>Stock</Label>
          <div className="flex items-center space-x-4 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={filters.inStock === true}
                onCheckedChange={(checked) =>
                  handleFilterChange("inStock", checked ? true : undefined)
                }
              />
              <label
                htmlFor="inStock"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                En stock
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="outOfStock"
                checked={filters.inStock === false}
                onCheckedChange={(checked) =>
                  handleFilterChange("inStock", checked ? false : undefined)
                }
              />
              <label
                htmlFor="outOfStock"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Rupture
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
