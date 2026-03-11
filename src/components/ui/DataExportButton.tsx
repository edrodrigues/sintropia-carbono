"use client";

import { cx } from "@/lib/utils";
import { RiDownloadLine } from "@remixicon/react";
import { useState } from "react";

interface DataExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  columns?: { key: string; header: string }[];
  label?: string;
  className?: string;
}

export function DataExportButton({
  data,
  filename,
  columns,
  label = "Baixar CSV",
  className,
}: DataExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    if (data.length === 0) return;

    setIsExporting(true);

    try {
      // Determine columns to export
      const exportColumns = columns || 
        Object.keys(data[0]).map(key => ({ key, header: key }));

      // Create CSV header
      const header = exportColumns.map(col => col.header).join(",");

      // Create CSV rows
      const rows = data.map(row => 
        exportColumns.map(col => {
          const value = row[col.key];
          // Handle values that might contain commas or quotes
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(",")
      );

      // Combine header and rows
      const csv = [header, ...rows].join("\n");

      // Create blob and download
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().slice(0, 7)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToCSV}
      disabled={isExporting || data.length === 0}
      className={cx(
        "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        "bg-emerald-600 text-white hover:bg-emerald-700",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <RiDownloadLine className="w-4 h-4" />
      {isExporting ? "Exportando..." : label}
    </button>
  );
}
