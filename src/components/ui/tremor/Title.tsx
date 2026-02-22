import { cx } from "@/lib/utils";
import { type ReactNode } from "react";

interface TitleProps {
  children: ReactNode;
  className?: string;
}

export function Title({ children, className }: TitleProps) {
  return (
    <h3 className={cx("text-lg font-bold text-gray-900 dark:text-white mb-4", className)}>
      {children}
    </h3>
  );
}
