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
      className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors min-w-[44px] min-h-[24px] disabled:opacity-50 ${
        initialActive ? "bg-emerald-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          initialActive ? "translate-x-5" : ""
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
