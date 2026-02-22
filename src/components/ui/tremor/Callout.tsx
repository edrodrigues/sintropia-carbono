import { cx } from "@/lib/utils";
import { type ReactNode } from "react";

type CalloutVariant = "info" | "warning" | "success" | "error";

interface CalloutProps {
  children: ReactNode;
  variant?: CalloutVariant;
  className?: string;
  title?: string;
}

const variantClasses: Record<CalloutVariant, { bg: string; border: string; title: string }> = {
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-100 dark:border-blue-800",
    title: "text-blue-900 dark:text-blue-200",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-100 dark:border-yellow-800",
    title: "text-yellow-900 dark:text-yellow-200",
  },
  success: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-100 dark:border-green-800",
    title: "text-green-900 dark:text-green-200",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-100 dark:border-red-800",
    title: "text-red-900 dark:text-red-200",
  },
};

export function Callout({ children, variant = "info", className, title }: CalloutProps) {
  const styles = variantClasses[variant];
  
  return (
    <div className={cx("rounded-xl p-6 border", styles.bg, styles.border, className)}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {title && (
            <h3 className={cx("text-lg font-bold mb-3", styles.title)}>
              {title}
            </h3>
          )}
          <div className={cx("text-sm", styles.title)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
