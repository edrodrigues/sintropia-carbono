"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftRight, X } from "lucide-react";

interface ComparisonBarProps {
  selectedIds: string[];
  totalAvailable: number;
  onClearSelection: () => void;
}

export function ComparisonBar({ selectedIds, onClearSelection }: ComparisonBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const count = selectedIds.length;

  if (count === 0) return null;

  const goCompare = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "comparator");
    params.set("sel", selectedIds.join(","));
    params.delete("asset");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      role="toolbar"
      aria-label="Comparison actions"
      className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
        <span className="text-sm text-gray-700">
          <strong className="text-blue-700">{count}</strong> itens selecionados para comparar
        </span>
        <div className="flex gap-2">
          <button
            onClick={onClearSelection}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300 cursor-pointer min-h-[44px]"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            Limpar
          </button>
          <button
            onClick={goCompare}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer min-h-[44px]"
          >
            <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
            Comparar referências
          </button>
        </div>
      </div>
    </div>
  );
}
