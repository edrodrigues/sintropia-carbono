"use client";

import { cx, focusInput } from "@/lib/utils";
import { type SelectHTMLAttributes } from "react";

interface SectorFilterProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  sectors: string[];
  allLabel?: string;
  className?: string;
}

export function SectorFilter({
  sectors,
  allLabel = "Todos os setores",
  className,
  ...props
}: SectorFilterProps) {
  return (
    <select
      className={cx(
        "px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
        focusInput,
        className
      )}
      {...props}
    >
      <option value="">{allLabel}</option>
      {sectors.map((sector) => (
        <option key={sector} value={sector}>
          {sector}
        </option>
      ))}
    </select>
  );
}
