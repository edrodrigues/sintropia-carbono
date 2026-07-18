"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { FilterPanel } from "./FilterPanel";
import { ComparisonBar } from "./ComparisonBar";
import { CadTrustScore } from "./CadTrustScore";
import { convertPrice, getCurrencySymbol, formatConvertedPrice } from "@/lib/services/currency-utils";
import type { ConversionRates } from "@/lib/services/currency-utils";
import type { Database } from "@/types/supabase";

type SnapshotRow = Database["public"]["Views"]["v_market_snapshot"]["Row"];

interface ExplorerTabProps {
  assets: SnapshotRow[];
  filterOptions: {
    assetTypes: { label: string; value: string }[];
    geographies: { label: string; value: string }[];
    registries: { label: string; value: string }[];
    technologies: { label: string; value: string }[];
    currencies: { label: string; value: string }[];
    referenceTypes: { label: string; value: string }[];
  };
  displayCurrency?: string;
  rates?: ConversionRates;
}

function referenceBadge(type: string | null) {
  switch (type) {
    case "trade": return { label: "Negócio realizado", color: "bg-emerald-50 text-emerald-700" };
    case "bid": return { label: "Bid", color: "bg-sky-50 text-sky-700" };
    case "ask": return { label: "Ask", color: "bg-sky-50 text-sky-700" };
    case "closing": return { label: "Fechamento", color: "bg-gray-100 text-gray-600" };
    case "indicative": return { label: "Indicativo", color: "bg-gray-100 text-gray-600" };
    default: return { label: "—", color: "bg-gray-100 text-gray-600" };
  }
}

function formatPrice(item: SnapshotRow, toCurrency: string, rates?: ConversionRates): string {
  if (item.price_display && toCurrency === (item.currency || "USD")) return item.price_display;
  if (item.price !== null) return formatConvertedPrice(item.price, item.currency, toCurrency, rates);
  if (item.price_low !== null && item.price_high !== null) {
    if (rates && item.currency && item.currency !== toCurrency) {
      const low = convertPrice(Number(item.price_low), item.currency, toCurrency, rates);
      const high = convertPrice(Number(item.price_high), item.currency, toCurrency, rates);
      const sym = getCurrencySymbol(toCurrency);
      return `${sym}${low.toFixed(2)} - ${sym}${high.toFixed(2)}`;
    }
    return `${item.price_low} - ${item.price_high}`;
  }
  return "—";
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const now = new Date();
  const ref = new Date(dateStr);
  const diffMs = now.getTime() - ref.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export function ExplorerTabInner({ assets, filterOptions, displayCurrency = "USD", rates }: ExplorerTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedIds = useMemo(() => {
    const sel = searchParams.get("sel");
    return sel ? sel.split(",").filter(Boolean) : [];
  }, [searchParams]);

  const toggleSelect = useCallback(
    (assetId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get("sel")?.split(",").filter(Boolean) || [];
      const next = current.includes(assetId)
        ? current.filter((id) => id !== assetId)
        : [...current, assetId];
      if (next.length > 0) {
        params.set("sel", next.join(","));
      } else {
        params.delete("sel");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const clearSelection = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sel");
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const selectAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sel", assets.map((a) => a.asset_id).filter(Boolean).join(","));
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams, assets]);

  const isAllSelected = assets.length > 0 && assets.every((a) => selectedIds.includes(a.asset_id ?? ""));

  return (
    <div className="space-y-4 pb-20">
      <FilterPanel filterOptions={filterOptions} />

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          <strong className="text-gray-700">{assets.length}</strong> referências encontradas
        </span>
        <button
          onClick={isAllSelected ? clearSelection : selectAll}
          className="text-blue-600 hover:underline font-medium cursor-pointer min-h-[44px] px-2 py-1"
        >
          {isAllSelected ? "Desmarcar todas" : "Selecionar todas"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="w-10 px-3 py-2.5">
                  <label className="flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={selectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      aria-label="Select all assets"
                    />
                  </label>
                </th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Ativo</th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Tipo de preço</th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Score</th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Preço</th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Atributos</th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Fonte</th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((item) => {
                const ref = referenceBadge(item.reference_type);
                const isSelected = selectedIds.includes(item.asset_id ?? "");
                return (
                  <tr
                    key={item.price_id}
                    className={`border-b border-gray-50 transition-colors ${
                      isSelected ? "bg-blue-50/30" : "hover:bg-sky-50/50"
                    }`}
                  >
                    <td className="px-3 py-3">
                      <label className="flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => item.asset_id && toggleSelect(item.asset_id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          aria-label={`Select ${item.asset_name}`}
                        />
                      </label>
                    </td>
                    <td
                      className="px-3 py-3 cursor-pointer"
                      onClick={() => item.asset_id && toggleSelect(item.asset_id)}
                    >
                      <span className="text-sm font-semibold text-gray-900">{item.asset_name}</span>
                      <span className="block text-[11px] text-gray-400">{item.asset_type === "carbon_credit" ? "Carbono" : item.asset_type === "irec" ? "I-REC" : item.asset_type}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${ref.color}`}>
                        {ref.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <CadTrustScore
                        ratingBezero={item.rating_bezero}
                        ratingSylvera={item.rating_sylvera}
                        isCcpAligned={item.is_ccp_aligned}
                        variant="compact"
                      />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-sm font-mono font-bold text-gray-900">{formatPrice(item, displayCurrency, rates)}</span>
                      <span className="block text-[10px] text-gray-400">{item.currency || "—"} / {item.unit || "—"}</span>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span className="text-[11px] text-gray-500">
                        {[item.vintage_year, item.country, item.registry, item.technology].filter(Boolean).join(" · ")}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500 hidden md:table-cell">
                      {item.source_name ? (
                        item.source_url ? (
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {item.source_name}
                          </a>
                        ) : (
                          item.source_name
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3 text-right text-xs text-gray-400 font-mono hidden md:table-cell">
                      {timeAgo(item.reference_date)}
                    </td>
                  </tr>
                );
              })}
              {assets.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Nenhuma referência encontrada</p>
                      <p className="text-xs text-gray-400">Tente ajustar os filtros ou buscar por outros termos</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ComparisonBar
        selectedIds={selectedIds}
        totalAvailable={assets.length}
        onClearSelection={clearSelection}
      />
    </div>
  );
}
