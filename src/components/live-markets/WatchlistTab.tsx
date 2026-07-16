import Link from "next/link";
import { getMarketSnapshot } from "@/lib/queries/live-markets";
import { createClient } from "@/lib/supabase/server";
import { Info, Bell, Eye, AlertTriangle } from "lucide-react";
import type { Database } from "@/types/supabase";

type SnapshotRow = Database["public"]["Views"]["v_market_snapshot"]["Row"];

function formatPrice(item: SnapshotRow): string {
  if (item.price_display) return item.price_display;
  if (item.price !== null) return `${item.currency || "$"}${Number(item.price).toFixed(2)}`;
  return "—";
}

function assetTypeLabel(type: string | null) {
  switch (type) {
    case "carbon_credit": return { label: "Carbono", color: "bg-emerald-50 text-emerald-700" };
    case "irec": return { label: "I-REC", color: "bg-sky-50 text-sky-700" };
    default: return { label: type || "Outro", color: "bg-gray-100 text-gray-600" };
  }
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
  return `${diffDays} dias atrás`;
}

const SAMPLE_ALERTS = [
  { id: "1", name: "EUA Dec-26 acima de €12.50", condition: "Preço > €12.50/tCO₂", active: true, icon: "warn" as const },
  { id: "2", name: "I-REC Brasil — novo dado disponível", condition: "Qualquer novo preço", active: true, icon: "info" as const },
  { id: "3", name: "VCU REDD+ — variação > 5%", condition: "Mudança > 5% em 7d", active: false, icon: "warn" as const },
  { id: "4", name: "Fonte CBL Markets indisponível", condition: "Falha de atualização > 24h", active: true, icon: "error" as const },
];

const SAMPLE_HISTORY = [
  { color: "bg-amber-500", text: "EUA Dec-26 atingiu €12.52 — acima do limite de €12.50", time: "Hoje, 14:32" },
  { color: "bg-sky-500", text: "I-REC Brasil — novo preço publicado: $1.82/MWh", time: "Hoje, 13:15" },
  { color: "bg-red-600", text: "CBL Markets — fonte indisponível há 26 horas", time: "Ontem, 12:00" },
  { color: "bg-emerald-500", text: "I-REC China — dado atualizado: $0.95/MWh (+1,1%)", time: "14 Jul, 09:45" },
  { color: "bg-amber-500", text: "GS Gold Standard — dado não atualizado há 48h", time: "13 Jul, 16:20" },
];

const iconMap = {
  warn: <AlertTriangle className="w-4 h-4 text-amber-600" />,
  info: <Info className="w-4 h-4 text-sky-600" />,
  error: (
    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

const iconBg = {
  warn: "bg-amber-50",
  info: "bg-sky-50",
  error: "bg-red-50",
};

export async function WatchlistTab({ locale = "pt" }: { locale?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const snapshot = await getMarketSnapshot();
  const watchlistAssets = snapshot.filter((a) => a.price !== null).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-400" />
            Watchlist
          </h3>
          <span className="text-xs text-gray-400">{watchlistAssets.length} ativos</span>
        </div>
        {user ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Ativo</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Preço atual</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Fonte</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Última atualização</th>
                </tr>
              </thead>
              <tbody>
                {watchlistAssets.map((item) => {
                  const type = assetTypeLabel(item.asset_type);
                  return (
                    <tr key={item.asset_id} className="border-b border-gray-50 hover:bg-sky-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">{item.asset_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${type.color}`}>
                          {type.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-mono font-bold text-gray-900">{formatPrice(item)}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{item.source_name || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono hidden sm:table-cell">{timeAgo(item.reference_date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8">
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex gap-3 items-start">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-sky-800 font-medium">
                  Faça login para acompanhar seus ativos favoritos e receber notificações.
                </p>
                <Link
                  href={`/${locale}/login`}
                  className="inline-block mt-2 text-sm font-semibold text-blue-700 hover:underline"
                >
                  Entrar / Registrar →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-400" />
            Alertas ativos
          </h3>
          <span className="text-xs text-gray-400">{SAMPLE_ALERTS.length} alertas</span>
        </div>
        <div className="divide-y divide-gray-50">
          {SAMPLE_ALERTS.map((alert) => (
            <div key={alert.id} className="px-6 py-3.5 flex items-center gap-3 hover:bg-gray-50/50">
              <div className={`w-8 h-8 rounded-lg ${iconBg[alert.icon]} flex items-center justify-center shrink-0`}>
                {iconMap[alert.icon]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{alert.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{alert.condition}</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${alert.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {alert.active ? "Ativo" : "Pausado"}
                </span>
                <div className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${alert.active ? "bg-emerald-500" : "bg-gray-300"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-all ${alert.active ? "left-[18px]" : "left-0.5"}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Histórico de notificações</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {SAMPLE_HISTORY.map((item, idx) => (
            <div key={idx} className="px-6 py-3 flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full ${item.color} mt-1.5 shrink-0`} />
              <p className="text-sm text-gray-700 flex-1">{item.text}</p>
              <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
