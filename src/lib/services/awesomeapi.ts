import { cache } from "react";
import { withMonitoring } from "@/lib/utils/monitoring";

const AWESOMEAPI_BASE = "https://economia.awesomeapi.com.br/json";

export interface CurrencyQuote {
  code: string;
  codein: string;
  name: string;
  high: string;
  low: string;
  varBid: string;
  pctChange: string;
  bid: string;
  ask: string;
  timestamp: string;
  create_date: string;
}

export interface ExchangeRates {
  [key: string]: CurrencyQuote;
}

const DEFAULT_PAIRS = ["USD-BRL", "EUR-BRL", "GBP-BRL", "ARS-BRL"];

export const getExchangeRates = cache(async (pairs?: string[]) => {
  const currencyPairs = pairs ?? DEFAULT_PAIRS;
  const key = currencyPairs.join(",");

  return withMonitoring(`getExchangeRates(${key})`, async () => {
    const url = `${AWESOMEAPI_BASE}/last/${currencyPairs.join(",")}`;

    const response = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`AwesomeAPI error: ${response.status} ${response.statusText}`);
    }

    const data: ExchangeRates = await response.json();
    return data;
  });
});

export const getExchangeRate = cache(async (from: string, to: string) => {
  const key = `${from}-${to}`;
  return withMonitoring(`getExchangeRate(${key})`, async () => {
    const url = `${AWESOMEAPI_BASE}/last/${from}-${to}`;

    const response = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`AwesomeAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const quote = data[key] as CurrencyQuote | undefined;

    if (!quote) {
      throw new Error(`No data for pair ${key}`);
    }

    return quote;
  });
});
