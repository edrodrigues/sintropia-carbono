"use client";

import { cx } from "@/lib/utils";

interface YearToggleProps {
  years: (2024 | 2025 | 2026)[];
  selectedYear: 2024 | 2025 | 2026;
  onChange: (year: 2024 | 2025 | 2026) => void;
  className?: string;
}

export function YearToggle({
  years,
  selectedYear,
  onChange,
  className,
}: YearToggleProps) {
  return (
    <div
      className={cx(
        "inline-flex rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 p-1",
        className
      )}
    >
      {years.map((year) => (
        <button
          key={year}
          onClick={() => onChange(year)}
          className={cx(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
            selectedYear === year
              ? "bg-emerald-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
          )}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
