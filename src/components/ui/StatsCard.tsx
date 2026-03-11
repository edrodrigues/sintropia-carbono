import { cx } from "@/lib/utils";
import { type ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className,
}: StatsCardProps) {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-500",
  };

  return (
    <div
      className={cx(
        "bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
          {title}
        </p>
        {icon && (
          <div className="text-emerald-600 dark:text-emerald-400">{icon}</div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-[#1e40af] dark:text-blue-400">
        {value}
      </h3>
      <div className="flex items-center gap-2 mt-2">
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        )}
        {trend && trendValue && (
          <span className={cx("text-sm font-medium", trendColors[trend])}>
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}
