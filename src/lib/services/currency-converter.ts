import { cache } from "react";
import { getExchangeRates } from "./awesomeapi";
import {
  convertPrice as utilConvertPrice,
  formatConvertedPrice as utilFormatConvertedPrice,
  getCurrencySymbol as utilGetCurrencySymbol,
  getDisplayCurrencies as utilGetDisplayCurrencies,
} from "./currency-utils";

export type { ConversionRates } from "./currency-utils";

export const getCurrencySymbol = utilGetCurrencySymbol;
export const convertPrice = utilConvertPrice;
export const formatConvertedPrice = utilFormatConvertedPrice;
export const getDisplayCurrencies = utilGetDisplayCurrencies;

/**
 * Fetches all exchange rates using AwesomeAPI (all pairs vs BRL),
 * then derives cross rates for any currency pair via BRL as pivot.
 */
export const fetchAllRates = cache(async (): Promise<Record<string, number>> => {
  const rates: Record<string, number> = {};
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
    rates["USD"] = 5.0;
    rates["EUR"] = 5.5;
    rates["GBP"] = 6.4;
    rates["ARS"] = 0.014;
  }

  return rates;
});
