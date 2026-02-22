import { cx, focusInput } from "@/lib/utils";
import { type InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function TextInput({ className, ...props }: TextInputProps) {
  return (
    <input
      className={cx(
        "flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
        focusInput,
        className
      )}
      {...props}
    />
  );
}
