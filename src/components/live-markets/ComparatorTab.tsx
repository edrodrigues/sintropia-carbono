import { getMarketByAssetIds } from "@/lib/queries/live-markets";
import { Info } from "lucide-react";
import { formatPrice, timeAgo, referenceLabel, referenceColor, typeLabel } from "@/lib/utils/market-helpers";
import { CadTrustScore } from "./CadTrustScore";
import type { ConversionRates } from "@/lib/services/currency-utils";
import type { Database } from "@/types/supabase";

type SnapshotRow = Database["public"]["Views"]["v_market_snapshot"]["Row"];

interface ComparisonRow {
  label: string;
  values: (string | React.ReactNode)[];
  highlight?: boolean;
}

export async function ComparatorTab({
  selectedIds,
  locale: _locale,
  displayCurrency = "USD",
  rates,
}: {
  selectedIds: string[];
  locale?: string;
  displayCurrency?: string;
  rates?: ConversionRates;
}) {
  let items: SnapshotRow[] = [];

  if (selectedIds.length > 0) {
    items = await getMarketByAssetIds(selectedIds, true);
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 font-medium">Nenhuma referência selecionada</p>
          <p className="text-xs text-gray-500 max-w-sm">Selecione ativos na aba &quot;Explorar preços&quot; para comparar preços e atributos lado a lado</p>
        </div>
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
      label: "Score CAD Trust",
      values: items.map((i) => (
        <CadTrustScore
          key={i.asset_id}
          ratingBezero={i.rating_bezero}
          ratingSylvera={i.rating_sylvera}
          isCcpAligned={i.is_ccp_aligned}
        />
      )),
    },
    {
      label: "Preço",
      highlight: true,
      values: items.map((i) => (
        <span key={i.asset_id} className="font-mono font-bold text-lg">
          {formatPrice(i, displayCurrency, rates)}
        </span>
      )),
    },
    {
      label: "Moeda / unidade",
      highlight: hasDifferentCurrencies || hasDifferentUnits,
      values: items.map((i) => `${displayCurrency} / ${i.unit || "—"}`),
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
    {
      label: "Fonte",
      values: items.map((i) =>
        i.source_name ? (
          i.source_url ? (
            <a
              key={i.asset_id}
              href={i.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {i.source_name}
            </a>
          ) : (
            i.source_name
          )
        ) : (
          "—"
        )
      ),
    },
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
            <p className="text-2xl font-mono font-bold text-gray-900">{formatPrice(item, displayCurrency, rates)}</p>
            <p className="text-xs text-gray-500 mb-2">{displayCurrency} / {item.unit || "—"}</p>
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
        <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer min-h-[44px]">
          Exportar CSV
        </button>
        <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-charcoal-ink rounded-lg cursor-pointer min-h-[44px]">
          Criar alerta
        </button>
      </div>
    </div>
  );
}
