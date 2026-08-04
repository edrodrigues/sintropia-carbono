"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { FilterPanel } from "./FilterPanel";
import { ComparisonBar } from "./ComparisonBar";
import { CadTrustScore } from "./CadTrustScore";
import { formatPrice, timeAgo, referenceBadge } from "@/lib/utils/market-helpers";
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

export function ExplorerTabInner({ assets, filterOptions, displayCurrency = "USD", rates }: ExplorerTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("CarbonoLiveMarkets");

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
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-deep-forest cursor-pointer"
                      aria-label="Select all assets"
                    />
                  </label>
                </th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{t("asset")}</th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{t("price_type")}</th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">{t("score")}</th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{t("price")}</th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">{t("volume")}</th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">{t("attributes")}</th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">{t("source")}</th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">{t("updated")}</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((item) => {
                const ref = referenceBadge(item.reference_type);
                const isSelected = selectedIds.includes(item.asset_id ?? "");
                return (
                  <tr
                    key={item.price_id}
                    className={`border-b border-gray-50 transition-colors cursor-pointer ${
                      isSelected ? "bg-blue-50/30" : "hover:bg-sky-50/50"
                    }`}
                    onClick={() => item.asset_id && toggleSelect(item.asset_id)}
                  >
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <label className="flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => item.asset_id && toggleSelect(item.asset_id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-deep-forest cursor-pointer"
                          aria-label={`Select ${item.asset_name}`}
                        />
                      </label>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm font-semibold text-gray-900">{item.asset_name}</span>
                      <span className="block text-[11px] text-gray-500">{item.asset_type === "carbon_credit" ? "Carbono" : item.asset_type === "irec" ? "I-REC" : item.asset_type}</span>
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
                      <span className="block text-[10px] text-gray-500">{item.currency || "—"} / {item.unit || "—"}</span>
                    </td>
                    <td className="px-3 py-3 text-right hidden sm:table-cell">
                      <span className="text-sm font-mono text-gray-900">
                        {item.volume != null ? Number(item.volume).toLocaleString("pt-BR") : "—"}
                      </span>
                      {item.volume != null && (
                        <span className="block text-[10px] text-gray-500">{item.unit || ""}</span>
                      )}
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
                            onClick={(e) => e.stopPropagation()}
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
                    <td className="px-3 py-3 text-right text-xs text-gray-500 font-mono hidden md:table-cell">
                      {timeAgo(item.reference_date, t)}
                    </td>
                  </tr>
                );
              })}
              {assets.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Nenhuma referência encontrada</p>
                      <p className="text-xs text-gray-500">Tente ajustar os filtros ou buscar por outros termos</p>
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
