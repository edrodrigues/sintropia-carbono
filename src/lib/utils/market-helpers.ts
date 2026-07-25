import { convertPrice, getCurrencySymbol, formatConvertedPrice } from "@/lib/services/currency-utils";
import type { ConversionRates } from "@/lib/services/currency-utils";
import type { Database } from "@/types/supabase";

type SnapshotRow = Database["public"]["Views"]["v_market_snapshot"]["Row"];

export function formatPrice(item: { price?: number | null; price_display?: string | null; price_low?: number | null; price_high?: number | null; currency?: string | null }, toCurrency: string, rates?: ConversionRates): string {
  if (item.price_display && toCurrency === (item.currency || "USD")) return item.price_display;
  if (item.price != null) return formatConvertedPrice(item.price, item.currency, toCurrency, rates);
  if (item.price_low != null && item.price_high != null) {
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

export function formatAvgPrice(
  byCurr: Record<string, { avg: number; count: number }> | undefined,
  toCurrency: string,
  rates?: ConversionRates,
): string {
  if (!byCurr || Object.keys(byCurr).length === 0) return "—";
  let totalCount = 0;
  let weightedSum = 0;
  for (const [fromCurr, { avg, count }] of Object.entries(byCurr)) {
    const converted = convertPrice(avg, fromCurr, toCurrency, rates);
    weightedSum += converted * count;
    totalCount += count;
  }
  const weightedAvg = weightedSum / totalCount;
  const sym = getCurrencySymbol(toCurrency);
  return `${sym}${weightedAvg.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}

export function timeAgo(dateStr: string | null): string {
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

export function assetTypeLabel(type: string | null): { label: string; color: string } {
  switch (type) {
    case "carbon_credit": return { label: "Carbono", color: "bg-emerald-50 text-emerald-700" };
    case "irec": return { label: "I-REC", color: "bg-sky-50 text-sky-700" };
    case "go": return { label: "GO", color: "bg-sky-50 text-sky-700" };
    case "cbio": return { label: "CBIO", color: "bg-amber-50 text-amber-700" };
    default: return { label: type || "Outro", color: "bg-gray-100 text-gray-600" };
  }
}

export function referenceBadge(type: string | null): { label: string; color: string } {
  switch (type) {
    case "trade": return { label: "Negócio realizado", color: "bg-emerald-50 text-emerald-700" };
    case "bid": return { label: "Bid", color: "bg-sky-50 text-sky-700" };
    case "ask": return { label: "Ask", color: "bg-sky-50 text-sky-700" };
    case "closing": return { label: "Fechamento", color: "bg-gray-100 text-gray-600" };
    case "indicative": return { label: "Indicativo", color: "bg-gray-100 text-gray-600" };
    default: return { label: "—", color: "bg-gray-100 text-gray-600" };
  }
}

export function referenceColor(type: string | null): string {
  switch (type) {
    case "trade": return "bg-emerald-50 text-emerald-700";
    case "bid": case "ask": return "bg-sky-50 text-sky-700";
    default: return "bg-gray-100 text-gray-600";
  }
}

export function referenceLabel(type: string | null): string {
  const map: Record<string, string> = {
    trade: "Negócio realizado",
    bid: "Bid",
    ask: "Ask",
    closing: "Fechamento",
    indicative: "Indicativo",
    rfq: "Sob consulta",
    range: "Faixa",
  };
  return map[type || ""] || "—";
}

export function typeLabel(type: string | null): string {
  const map: Record<string, string> = {
    carbon_credit: "Carbono (crédito)",
    irec: "I-REC",
    go: "GO (Garantia de Origem)",
    cbio: "CBIO",
  };
  return map[type || ""] || type || "—";
}

export function getLatestReferenceDate(items: SnapshotRow[]): string | null {
  let latest: string | null = null;
  for (const item of items) {
    if (item.reference_date && (!latest || item.reference_date > latest)) {
      latest = item.reference_date;
    }
  }
  return latest;
}
