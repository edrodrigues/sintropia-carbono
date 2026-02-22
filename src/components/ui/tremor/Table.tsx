import { cx } from "@/lib/utils";
import { type ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cx("overflow-x-auto", className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children, className }: { children: ReactNode; className?: string }) {
  return <thead className={cx(className)}>{children}</thead>;
}

export function TableBody({ children, className }: { children: ReactNode; className?: string }) {
  return <tbody className={cx(className)}>{children}</tbody>;
}

export function TableRow({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr 
      className={cx("border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50", className)}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableHeader({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <th 
      className={cx("text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-400", className)}
      onClick={onClick}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cx("py-3 px-3", className)}>{children}</td>;
}
