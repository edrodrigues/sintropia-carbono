import { getMarketByAssetIds, getMarketSnapshot } from "@/lib/queries/live-markets";
import { Info } from "lucide-react";
import type { Database } from "@/types/supabase";

type SnapshotRow = Database["public"]["Views"]["v_market_snapshot"]["Row"];

function formatPrice(item: SnapshotRow): string {
  if (item.price_display) return item.price_display;
  if (item.price !== null) return `${item.currency || "$"}${Number(item.price).toFixed(2)}`;
  if (item.price_low !== null && item.price_high !== null) return `${item.price_low} - ${item.price_high}`;
  return "—";
}

function referenceLabel(type: string | null): string {
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

function referenceColor(type: string | null): string {
  switch (type) {
    case "trade": return "bg-emerald-50 text-emerald-700";
    case "bid": case "ask": return "bg-sky-50 text-sky-700";
    default: return "bg-gray-100 text-gray-600";
  }
}

function typeLabel(type: string | null): string {
  const map: Record<string, string> = {
    carbon_credit: "Carbono (crédito)",
    irec: "I-REC",
    go: "GO (Garantia de Origem)",
    cbio: "CBIO",
  };
  return map[type || ""] || type || "—";
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const now = new Date();
  const ref = new Date(dateStr);
  const diffMs = now.getTime() - ref.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `${diffMins} min atrás`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d atrás`;
}

interface ComparisonRow {
  label: string;
  values: (string | React.ReactNode)[];
  highlight?: boolean;
}

export async function ComparatorTab({
  selectedIds,
  locale: _locale,
}: {
  selectedIds: string[];
  locale?: string;
}) {
  let items: SnapshotRow[] = [];

  if (selectedIds.length > 0) {
    items = await getMarketByAssetIds(selectedIds);
  } else {
    const snapshot = await getMarketSnapshot();
    items = snapshot.filter((a) => a.price !== null).slice(0, 3);
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <p className="text-gray-400 text-sm">Selecione ativos na aba &quot;Explorar preços&quot; para comparar.</p>
      </div>
    );
  }

  const hasDifferentTypes = new Set(items.map((i) => i.asset_type)).size > 1;
  const hasDifferentCurrencies = new Set(items.map((i) => i.currency)).size > 1;
  const hasDifferentUnits = new Set(items.map((i) => i.unit)).size > 1;

  const rows: ComparisonRow[] = [
    { label: "Tipo de ativo", values: items.map((i) => typeLabel(i.asset_type)) },
    { label: "Registro / programa", values: items.map((i) => i.registry || "—") },
    {
      label: "Preço",
      highlight: true,
      values: items.map((i) => (
        <span key={i.asset_id} className="font-mono font-bold text-lg">
          {formatPrice(i)}
        </span>
      )),
    },
    {
      label: "Moeda / unidade",
      highlight: hasDifferentCurrencies || hasDifferentUnits,
      values: items.map((i) => `${i.currency || "—"} / ${i.unit || "—"}`),
    },
    {
      label: "Tipo de referência",
      values: items.map((i) => (
        <span key={i.asset_id} className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${referenceColor(i.reference_type)}`}>
          {referenceLabel(i.reference_type)}
        </span>
      )),
    },
    { label: "Atualização", values: items.map((i) => timeAgo(i.reference_date)) },
    {
      label: "Geografia",
      highlight: hasDifferentTypes || hasDifferentCurrencies,
      values: items.map((i) => i.country || "—"),
    },
    { label: "Tecnologia", values: items.map((i) => i.technology || "—") },
    { label: "Vintage", values: items.map((i) => i.vintage_year ? String(i.vintage_year) : "—") },
    { label: "Volume", values: items.map((i) => i.volume != null ? `${Number(i.volume).toLocaleString("pt-BR")}` : "—") },
    { label: "Fonte", values: items.map((i) => i.source_name || "—") },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          {items.length} referências selecionadas
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <div
            key={item.asset_id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
          >
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Referência {idx + 1}
            </p>
            <p className="text-sm font-semibold text-gray-900 mb-2">{item.asset_name}</p>
            <p className="text-2xl font-mono font-bold text-gray-900">{formatPrice(item)}</p>
            <p className="text-xs text-gray-400 mb-2">{item.currency || "—"} / {item.unit || "—"}</p>
            <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${referenceColor(item.reference_type)}`}>
              {referenceLabel(item.reference_type)}
            </span>
          </div>
        ))}
      </div>

      {(hasDifferentTypes || hasDifferentCurrencies || hasDifferentUnits) && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex gap-3 items-start">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p className="text-xs text-sky-800 leading-relaxed">
            <strong className="font-semibold">Atenção:</strong> Estas referências pertencem a mercados ou categorias diferentes.
            Os preços não são diretamente comparáveis. Tipos de ativo, unidades, geografias e fontes podem diferir entre si.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-base font-semibold text-gray-900">Matriz comparativa</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-40">Atributo</th>
                {items.map((item) => (
                  <th key={item.asset_id} className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    {item.asset_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className={`border-b border-gray-50 ${row.highlight ? "bg-amber-50/30" : ""}`}
                >
                  <td className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {row.label}
                  </td>
                  {row.values.map((val, vi) => (
                    <td key={vi} className={`px-4 py-3 text-sm ${row.highlight ? "font-semibold" : ""}`}>
                      {typeof val === "string" ? <span className="text-gray-900">{val}</span> : val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          Exportar CSV
        </button>
        <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
          Criar alerta
        </button>
      </div>
    </div>
  );
}
