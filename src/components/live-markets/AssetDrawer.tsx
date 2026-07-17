"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X, Star, Bell } from "lucide-react";
import { PriceBarChart } from "./PriceChart";
import { convertPrice, getCurrencySymbol, formatConvertedPrice } from "@/lib/services/currency-utils";
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

function assetTypeLabel(type: string | null) {
  switch (type) {
    case "carbon_credit": return { label: "Carbono", color: "bg-emerald-50 text-emerald-700" };
    case "irec": return { label: "I-REC", color: "bg-sky-50 text-sky-700" };
    default: return { label: type || "Outro", color: "bg-gray-100 text-gray-600" };
  }
}

function referenceLabel(type: string | null): string {
  const map: Record<string, string> = {
    trade: "Negócio realizado",
    bid: "Bid",
    ask: "Ask",
    closing: "Fechamento",
    indicative: "Indicativo",
  };
  return map[type || ""] || "—";
}

export function AssetDrawer({ asset, priceSeries = [], relatedAssets = [], displayCurrency = "USD", rates }: AssetDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const open = !!asset;

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("asset");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  if (!asset) return null;

  const type = assetTypeLabel(asset.asset_type);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={close}
        />
      )}

      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
            <h2 className="text-base font-semibold text-gray-900 truncate">{asset.asset_name}</h2>
            <button
              onClick={close}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4 text-gray-500" />
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
              <p className="text-xs text-gray-400 mt-2">
                Atualizado {asset.reference_date || "—"}
              </p>
            </div>

            {priceSeries.length > 0 && (
              <div className="px-6 py-4 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Histórico de preços</h4>
                <PriceBarChart data={priceSeries} height={180} />
              </div>
            )}

            <div className="px-6 py-4 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Atributos</h4>
              <div className="grid grid-cols-2 gap-0">
                {[
                  { label: "Tipo", value: asset.asset_type === "carbon_credit" ? "Carbono (crédito)" : asset.asset_type === "irec" ? "I-REC" : asset.asset_type || "—" },
                  { label: "Geografia", value: asset.country || "—" },
                  { label: "Registro", value: asset.registry || "—" },
                  { label: "Tecnologia", value: asset.technology || "—" },
                  { label: "Vintage", value: asset.vintage_year ? String(asset.vintage_year) : "—" },
                  { label: "Volume", value: asset.volume != null ? `${Number(asset.volume).toLocaleString("pt-BR")}` : "—" },
                  { label: "Fonte", value: asset.source_name || "—" },
                  { label: "Categoria", value: asset.project_category || "—" },
                ].map((attr, idx) => (
                  <div
                    key={attr.label}
                    className={`py-3 ${idx % 2 === 0 ? "pr-4 border-r border-gray-100" : "pl-4"} ${
                      idx < 6 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{attr.label}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{attr.value}</p>
                  </div>
                ))}
              </div>
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
                      <p className="text-[11px] text-gray-400">{ra.registry || ra.country || "—"}</p>
                    </div>
                    <span className="text-sm font-mono font-bold text-gray-900 ml-3 shrink-0">
                      {formatPrice(ra, displayCurrency, rates)}
                    </span>
                  </div>
                ))}
                {relatedAssets.length === 0 && (
                  <p className="text-xs text-gray-400">Nenhuma referência relacionada</p>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-3 border-t border-gray-200 flex gap-2 shrink-0">
            <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Star className="w-4 h-4" />
              Watchlist
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
              <Bell className="w-4 h-4" />
              Criar alerta
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
