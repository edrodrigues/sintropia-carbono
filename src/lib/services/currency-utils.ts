export interface ConversionRates {
  [from: string]: number;
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
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
 * Converts a price from one currency to another using conversion rates.
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

  const priceInBrl = price * fromRate;
  return priceInBrl / toRate;
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
