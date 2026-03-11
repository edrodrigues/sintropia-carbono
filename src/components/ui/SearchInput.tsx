"use client";

import { cx, focusInput } from "@/lib/utils";
import { RiSearchLine } from "@remixicon/react";
import { type InputHTMLAttributes } from "react";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  containerClassName?: string;
}

export function SearchInput({
  className,
  containerClassName,
  ...props
}: SearchInputProps) {
  return (
    <div className={cx("relative", containerClassName)}>
      <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="search"
        className={cx(
          "w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
          focusInput,
          className
        )}
        {...props}
      />
    </div>
  );
}
