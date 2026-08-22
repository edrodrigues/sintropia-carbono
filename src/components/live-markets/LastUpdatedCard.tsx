"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LastUpdatedCard({ initialLastUpdate }: { initialLastUpdate: string | null }) {
  const [lastUpdate, setLastUpdate] = useState(initialLastUpdate);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("price_references:last_update")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "price_references" },
        (payload) => {
          const refDate = (payload.new as { reference_date?: string | null }).reference_date;
          if (refDate) {
            setLastUpdate((prev) => (!prev || refDate > prev ? refDate : prev));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Última atualização</h3>
        <span className="relative flex w-1.5 h-1.5" title="Atualiza automaticamente ao chegar novos dados">
          <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </span>
      </div>
      <p className="text-2xl font-bold font-mono text-gray-600">
        {lastUpdate ? new Date(lastUpdate).toLocaleDateString("pt-BR") : "—"}
      </p>
      <p className="text-[11px] text-gray-500 mt-1">fonte mais recente</p>
    </div>
  );
}
