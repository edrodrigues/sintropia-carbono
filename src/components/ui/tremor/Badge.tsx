import { cx } from "@/lib/utils";
import { type ReactNode } from "react";

type BadgeColor = "blue" | "green" | "red" | "gray" | "yellow" | "cyan" | "emerald" | "amber" | "pink";

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  blue: "bg-blue-700 text-white dark:bg-blue-600 dark:text-white",
  green: "bg-green-800 text-white dark:bg-green-700 dark:text-white",
  red: "bg-red-800 text-white dark:bg-red-700 dark:text-white",
  gray: "bg-gray-700 text-white dark:bg-gray-600 dark:text-white",
  yellow: "bg-yellow-800 text-white dark:bg-yellow-700 dark:text-white",
  cyan: "bg-cyan-800 text-white dark:bg-cyan-700 dark:text-white",
  emerald: "bg-emerald-800 text-white dark:bg-emerald-700 dark:text-white",
  amber: "bg-amber-800 text-white dark:bg-amber-700 dark:text-white",
  pink: "bg-pink-800 text-white dark:bg-pink-700 dark:text-white",
};

export function Badge({ children, color = "blue", className }: BadgeProps) {
  return (
    <span className={cx("px-2 py-1 rounded-full text-xs font-medium", colorClasses[color], className)}>
      {children}
    </span>
  );
}
