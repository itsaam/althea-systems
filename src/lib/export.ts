import ExcelJS from "exceljs";

/**
 * Génère un fichier Excel (.xlsx) ou CSV à partir de données tabulaires.
 * Remplace la dépendance `xlsx` (SheetJS) qui avait des CVEs critiques
 * (Prototype Pollution + ReDoS).
 */

interface ExportOptions {
  /** Nom de la feuille Excel (défaut: "Export") */
  sheetName?: string;
  /** Format de sortie */
  format: "csv" | "excel";
}

/**
 * Génère un Buffer contenant le fichier Excel ou CSV.
 * @param data — Tableau d'objets clé-valeur (les clés deviennent les headers)
 * @param options — Format et nom de feuille
 */
export async function generateExport(
  data: Record<string, string | number | boolean | null | undefined>[],
  options: ExportOptions
): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
  if (data.length === 0) {
    // Fichier vide avec juste les headers
    const csv = "";
    return {
      buffer: Buffer.from(csv, "utf-8"),
      contentType: "text/csv",
      extension: "csv",
    };
  }

  const headers = Object.keys(data[0]);

  if (options.format === "csv") {
    const rows = [
      headers.join(";"),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
            if (val === null || val === undefined) return "";
            const str = String(val);
            // Escape quotes and wrap if contains separator/quotes/newlines
            if (str.includes(";") || str.includes('"') || str.includes("\n")) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(";")
      ),
    ];

    return {
      buffer: Buffer.from("\uFEFF" + rows.join("\n"), "utf-8"), // BOM for Excel FR
      contentType: "text/csv; charset=utf-8",
      extension: "csv",
    };
  }

  // Excel via exceljs
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Althea Systems";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(options.sheetName || "Export");

  // Headers
  sheet.columns = headers.map((h) => ({
    header: h,
    key: h,
    width: Math.max(h.length + 4, 15),
  }));

  // Style headers
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, size: 10 };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE9E2E5" }, // shadow-grey-100
  };

  // Data rows
  for (const row of data) {
    sheet.addRow(row);
  }

  const xlsxBuffer = await workbook.xlsx.writeBuffer();

  return {
    buffer: Buffer.from(xlsxBuffer),
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extension: "xlsx",
  };
}
