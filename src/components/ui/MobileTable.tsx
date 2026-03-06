"use client";

import { useState } from "react";

interface Column {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  mobileHidden?: boolean;
}

interface MobileTableProps {
  data: Record<string, unknown>[];
  columns: Column[];
  defaultMobileColumns?: string[];
  expandableColumns?: string[];
}

export function MobileTableWrapper({
  data,
  columns,
  defaultMobileColumns = ["rank", "empresa", "delta"],
}: MobileTableProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const desktopColumns = columns;

  const defaultCols = columns.filter((col) =>
    defaultMobileColumns.includes(col.key)
  );

  const getColumnValue = (item: Record<string, unknown>, key: string) => {
    return item[key] !== undefined ? String(item[key]) : "";
  };

  const getDeltaClass = (value: unknown) => {
    if (typeof value === "number") {
      if (value >= 50) return "text-green-600 dark:text-green-400 font-bold";
      if (value >= 20) return "text-green-500";
      if (value < 0) return "text-red-600 dark:text-red-400";
    }
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {desktopColumns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-3 font-semibold text-gray-600 dark:text-gray-400 text-sm ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                {desktopColumns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3 px-3 ${
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                        ? "text-center"
                        : ""
                    }`}
                  >
                    {getColumnValue(item, col.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {data.map((item, index) => {
          const isExpanded = expandedItems.has(index);
          const hasExpandable = columns.some(
            (col) => !defaultMobileColumns.includes(col.key)
          );

          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {defaultCols.map((col) => (
                    <div
                      key={col.key}
                      className={col.align === "right" ? "text-right" : ""}
                    >
                      {col.key === "rank" ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {getColumnValue(item, col.key)}
                          </span>
                        </div>
                      ) : col.key === "empresa" ||
                        col.header === "Corporação" ||
                        col.header === "Empresa" ? (
                        <div className="font-bold text-gray-900 dark:text-white text-lg">
                          {getColumnValue(item, col.key)}
                        </div>
                      ) : col.header === "Delta %" ||
                        col.key === "delta" ? (
                        <div className={`text-lg font-semibold ${getDeltaClass(item[col.key])}`}>
                          {getColumnValue(item, col.key)}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-xs uppercase text-gray-500 block">
                            {col.header}
                          </span>
                          {getColumnValue(item, col.key)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {hasExpandable && (
                  <button
                    onClick={() => toggleExpand(index)}
                    className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label={isExpanded ? "Recolher" : "Expandir"}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {columns
                      .filter((col) => !defaultMobileColumns.includes(col.key))
                      .map((col) => (
                        <div key={col.key}>
                          <span className="text-xs uppercase text-gray-500">
                            {col.header}
                          </span>
                          <div className="font-medium">
                            {getColumnValue(item, col.key)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
