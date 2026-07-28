"use client";

import { useTransition } from "react";
import { toggleAlertActive } from "@/lib/queries/market-actions";

export function AlertToggle({
  alertId,
  alertName,
  initialActive,
}: {
  alertId: string;
  alertName: string;
  initialActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleAlertActive(alertId, !initialActive);
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={initialActive}
      aria-label={`${initialActive ? "Desativar" : "Ativar"} alerta: ${alertName}`}
      disabled={isPending}
      onClick={handleToggle}
      className={`w-11 h-7 rounded-full relative cursor-pointer transition-colors min-w-[44px] min-h-[44px] disabled:opacity-50 flex items-center ${
        initialActive ? "bg-emerald-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          initialActive ? "translate-x-4" : ""
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
