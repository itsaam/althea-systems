export type CsvCellValue = string | number | boolean | null | undefined | Date;

export interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => CsvCellValue;
}

function escapeCell(value: CsvCellValue): string {
  if (value === null || value === undefined) return "";
  let str: string;
  if (value instanceof Date) {
    str = value.toLocaleDateString("fr-FR");
  } else if (typeof value === "boolean") {
    str = value ? "Oui" : "Non";
  } else {
    str = String(value);
  }
  if (/[",;\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv<T>(
  rows: T[],
  columns: CsvColumn<T>[],
  separator = ";",
): string {
  const headerLine = columns.map((col) => escapeCell(col.header)).join(separator);
  const dataLines = rows.map((row) =>
    columns.map((col) => escapeCell(col.accessor(row))).join(separator),
  );
  return [headerLine, ...dataLines].join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  // BOM for Excel UTF-8 recognition
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function buildFilename(base: string): string {
  const date = new Date().toISOString().split("T")[0];
  return `${base}_${date}.csv`;
}
