import { cx } from "@/lib/utils";
import { type ReactNode } from "react";

interface MetricProps {
  children: ReactNode;
  className?: string;
}

interface MetricSubtitleProps {
  children: ReactNode;
}

export function Metric({ children, className }: MetricProps) {
  return (
    <h3 className={cx("text-3xl font-bold text-[#1e40af] dark:text-blue-400", className)}>
      {children}
    </h3>
  );
}

export function MetricSubtitle({ children }: MetricSubtitleProps) {
  return (
    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
      {children}
    </p>
  );
}
