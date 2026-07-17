"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { getDisplayCurrencies } from "@/lib/services/currency-utils";

const CURRENCIES = getDisplayCurrencies();

export function CurrencySelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCurrency = searchParams.get("displayCurrency") || "USD";

  const onChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "USD") {
        params.delete("displayCurrency");
      } else {
        params.set("displayCurrency", value);
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
        Exibir em
      </label>
      <select
        value={currentCurrency}
        onChange={(e) => onChange(e.target.value)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 hover:border-gray-400"
      >
        {CURRENCIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
