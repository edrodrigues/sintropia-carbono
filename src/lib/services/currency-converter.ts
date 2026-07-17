import { cache } from "react";
import { getExchangeRates } from "./awesomeapi";

export interface ConversionRates {
  [from: string]: number;
}

let cachedRates: ConversionRates | null = null;
let lastFetched = 0;

const CACHE_TTL = 5 * 60 * 1000;

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  BRL: "R$",
  ARS: "ARS$",
};

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

/**
 * Fetches all exchange rates using AwesomeAPI (all pairs vs BRL),
 * then derives cross rates for any currency pair via BRL as pivot.
 */
export const fetchAllRates = cache(async (): Promise<ConversionRates> => {
  const now = Date.now();
  if (cachedRates && now - lastFetched < CACHE_TTL) {
    return cachedRates;
  }

  const rates: ConversionRates = {};
  rates["BRL"] = 1;

  const pairs = ["USD-BRL", "EUR-BRL", "GBP-BRL", "ARS-BRL"];
  try {
    const data = await getExchangeRates(pairs);
    for (const raw of Object.values(data)) {
      const from = raw.code;
      const bid = parseFloat(raw.bid);
      if (!isNaN(bid) && bid > 0) {
        rates[from] = bid;
      }
    }
  } catch {
    // If API fails, use a simple fallback rate
    rates["USD"] = 5.0;
    rates["EUR"] = 5.5;
    rates["GBP"] = 6.4;
    rates["ARS"] = 0.014;
  }

  cachedRates = rates;
  lastFetched = now;
  return rates;
});

/**
 * Converts a price from one currency to another using AwesomeAPI rates.
 * Falls back to the original price on failure.
 */
export function convertPrice(
  price: number,
  fromCurrency: string,
  toCurrency: string,
  rates?: ConversionRates,
): number {
  if (!rates) return price;
  if (fromCurrency === toCurrency) return price;

  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];
  if (!fromRate || !toRate) return price;

  // Convert: price_in_BRL = price / fromRate (BRL per fromCurrency)
  // Then: price_in_target = price_in_BRL * toRate
  const priceInBrl = price / fromRate;
  return priceInBrl * toRate;
}

/**
 * Formats a price value with currency symbol and locale-aware number.
 */
export function formatConvertedPrice(
  priceValue: number | null,
  fromCurrency: string | null,
  toCurrency: string,
  rates?: ConversionRates,
): string {
  if (priceValue === null) return "—";
  const cur = fromCurrency || "USD";
  const converted = convertPrice(priceValue, cur, toCurrency, rates);
  const symbol = getCurrencySymbol(toCurrency);
  const formatted = converted.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
  return `${symbol}${formatted}`;
}

/**
 * Returns the supported display currencies with labels.
 */
export function getDisplayCurrencies() {
  return [
    { value: "USD", label: "USD ($)" },
    { value: "BRL", label: "BRL (R$)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "ARS", label: "ARS (ARS$)" },
  ];
}
