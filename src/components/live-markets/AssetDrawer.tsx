"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import { X, Star, Bell } from "lucide-react";
import { PriceBarChart } from "./PriceChart";
import { formatPrice, assetTypeLabel, referenceLabel } from "@/lib/utils/market-helpers";
import type { ConversionRates } from "@/lib/services/currency-utils";
import type { PriceSeriesPoint } from "@/lib/queries/price-series";
import type { Database } from "@/types/supabase";

type SnapshotRow = Database["public"]["Views"]["v_market_snapshot"]["Row"];

interface AssetDrawerProps {
  asset: SnapshotRow | null | undefined;
  priceSeries?: PriceSeriesPoint[];
  relatedAssets?: SnapshotRow[];
  displayCurrency?: string;
  rates?: ConversionRates;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
}

export function AssetDrawer({ asset, priceSeries = [], relatedAssets = [], displayCurrency = "USD", rates }: AssetDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const open = !!asset;

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("asset");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      if (e.key === "Tab") {
        const container = drawerRef.current;
        if (!container) return;

        const focusable = getFocusableElements(container);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  if (!asset) return null;

  const type = assetTypeLabel(asset.asset_type);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Asset details: ${asset.asset_name}`}
        className={`fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
            <h2 className="text-base font-semibold text-gray-900 truncate">{asset.asset_name}</h2>
            <button
              ref={closeButtonRef}
              onClick={close}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close asset details"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${type.color}`}>
                  {type.label}
                </span>
                <span className="inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full bg-gray-100 text-gray-600">
                  {referenceLabel(asset.reference_type)}
                </span>
              </div>
              <p className="text-4xl font-mono font-bold text-gray-900">{formatPrice(asset, displayCurrency, rates)}</p>
              <p className="text-sm text-gray-500 mt-1">{displayCurrency} / {asset.unit || "—"}</p>
              <p className="text-xs text-gray-500 mt-2">
                Atualizado {asset.reference_date || "—"}
              </p>
            </div>

            {priceSeries.length > 0 && (
              <div className="px-6 py-4 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Histórico de preços</h4>
                <div role="img" aria-label={`Price history chart for ${asset.asset_name} showing data from ${priceSeries[0]?.day} to ${priceSeries[priceSeries.length - 1]?.day}`}>
                  <PriceBarChart data={priceSeries} height={180} />
                </div>
              </div>
            )}

            <div className="px-6 py-4 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Atributos</h4>
              <dl className="grid grid-cols-2 gap-0">
                {[
                  { label: "Tipo", value: asset.asset_type === "carbon_credit" ? "Carbono (crédito)" : asset.asset_type === "irec" ? "I-REC" : asset.asset_type || "—" },
                  { label: "Geografia", value: asset.country || "—" },
                  { label: "Registro", value: asset.registry || "—" },
                  { label: "Tecnologia", value: asset.technology || "—" },
                  { label: "Vintage", value: asset.vintage_year ? String(asset.vintage_year) : "—" },
                  { label: "Volume", value: asset.volume != null ? `${Number(asset.volume).toLocaleString("pt-BR")}` : "—" },
                  { label: "Fonte", value: asset.source_name ? (
                    asset.source_url ? (
                      <a
                        href={asset.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {asset.source_name}
                      </a>
                    ) : (
                      asset.source_name
                    )
                  ) : "—" },
                  { label: "Categoria", value: asset.project_category || "—" },
                ].map((attr, idx) => (
                  <div
                    key={attr.label}
                    className={`py-3 ${idx % 2 === 0 ? "pr-4 border-r border-gray-100" : "pl-4"} ${
                      idx < 6 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <dt className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{attr.label}</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-0.5">{attr.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="px-6 py-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Referências relacionadas</h4>
              <div className="space-y-2">
                {relatedAssets.slice(0, 3).map((ra) => (
                  <div
                    key={ra.asset_id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-sky-50/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{ra.asset_name}</p>
                      <p className="text-[11px] text-gray-500">{ra.registry || ra.country || "—"}</p>
                    </div>
                    <span className="text-sm font-mono font-bold text-gray-900 ml-3 shrink-0">
                      {formatPrice(ra, displayCurrency, rates)}
                    </span>
                  </div>
                ))}
                {relatedAssets.length === 0 && (
                  <p className="text-xs text-gray-500">Nenhuma referência relacionada</p>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-3 border-t border-gray-200 flex gap-2 shrink-0">
            <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer min-h-[44px]">
              <Star className="w-4 h-4" aria-hidden="true" />
              Watchlist
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer min-h-[44px]">
              <Bell className="w-4 h-4" aria-hidden="true" />
              Criar alerta
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
