"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  buildFilename,
  downloadCsv,
  toCsv,
  type CsvColumn,
} from "@/lib/csv-export";

interface ClientExportButtonProps<T> {
  rows: T[];
  columns: CsvColumn<T>[];
  filename: string;
  disabled?: boolean;
  label?: string;
}

export function ClientExportButton<T>({
  rows,
  columns,
  filename,
  disabled,
  label = "Exporter CSV",
}: ClientExportButtonProps<T>) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (rows.length === 0) {
      toast.info("Aucune donnée à exporter");
      return;
    }
    setIsExporting(true);
    try {
      const csv = toCsv(rows, columns);
      downloadCsv(buildFilename(filename), csv);
      toast.success(`${rows.length} ligne${rows.length > 1 ? "s" : ""} exportée${rows.length > 1 ? "s" : ""}`);
    } catch (error) {
      console.error("Erreur export CSV:", error);
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || isExporting || rows.length === 0}
    >
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? "Export..." : label}
    </Button>
  );
}
