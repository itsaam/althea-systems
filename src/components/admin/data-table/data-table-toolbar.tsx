"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onResetFilters?: () => void;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
}

export function DataTableToolbar({
  searchValue = "",
  onSearchChange,
  onResetFilters,
  filters,
  actions,
}: DataTableToolbarProps) {
  const isFiltered = searchValue?.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Rechercher..."
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {isFiltered && onResetFilters && (
            <Button
              variant="ghost"
              onClick={onResetFilters}
              className="h-8 px-2 lg:px-3"
            >
              Réinitialiser
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
      {filters && <div>{filters}</div>}
    </div>
  );
}
