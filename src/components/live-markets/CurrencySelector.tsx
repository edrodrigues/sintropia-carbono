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
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
        Exibir em
      </span>
      <div
        role="radiogroup"
        aria-label="Display currency"
        className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5"
      >
        {CURRENCIES.map((c) => (
          <button
            key={c.value}
            role="radio"
            aria-checked={currentCurrency === c.value}
            onClick={() => onChange(c.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors min-h-[32px] ${
              currentCurrency === c.value
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {c.value}
          </button>
        ))}
      </div>
    </div>
  );
}
