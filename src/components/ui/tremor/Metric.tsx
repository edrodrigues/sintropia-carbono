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
    <h3 className={cx("text-3xl font-bold tabular-nums text-[#0a382c] dark:text-electric-emerald", className)}>
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
