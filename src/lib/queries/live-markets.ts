import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { withMonitoring } from "@/lib/utils/monitoring";
import { logger } from "@/lib/utils/logger";
import type { Database } from "@/types/supabase";

type MarketSnapshot = Database["public"]["Views"]["v_market_snapshot"]["Row"];
type PriceChange = Database["public"]["Views"]["v_price_changes"]["Row"];
type PriceSeries = Database["public"]["Views"]["price_series"]["Row"];

export const getMarketSnapshot = cache(async () => {
  return withMonitoring("getMarketSnapshot", async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("v_market_snapshot")
      .select("*")
      .order("asset_type", { ascending: true })
      .order("asset_name", { ascending: true });

    if (error) {
      logger.error("Erro ao buscar snapshot do mercado", { error });
      return [];
    }
    return data as MarketSnapshot[];
  });
});

export const getMarketByType = cache(async (assetType: string) => {
  return withMonitoring(`getMarketByType(${assetType})`, async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("v_market_snapshot")
      .select("*")
      .eq("asset_type", assetType)
      .order("asset_name", { ascending: true });

    if (error) {
      logger.error(`Erro ao buscar mercado tipo ${assetType}`, { error });
      return [];
    }
    return data as MarketSnapshot[];
  });
});

export const getPriceChanges = cache(async () => {
  return withMonitoring("getPriceChanges", async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("v_price_changes")
      .select("*")
      .order("change_pct", { ascending: false, nullsFirst: false });

    if (error) {
      logger.error("Erro ao buscar variações de preço", { error });
      return [];
    }
    return data as PriceChange[];
  });
});

export const getPriceSeries = cache(async (assetId: string) => {
  return withMonitoring(`getPriceSeries(${assetId})`, async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("price_series")
      .select("*")
      .eq("asset_id", assetId)
      .order("day", { ascending: true });

    if (error) {
      logger.error(`Erro ao buscar série de preços para ${assetId}`, { error });
      return [];
    }
    return data as PriceSeries[];
  });
});

export const getMarketSummary = cache(async () => {
  return withMonitoring("getMarketSummary", async () => {
    const snapshot = await getMarketSnapshot();

    const carbonPrices = snapshot.filter(
      (a) => a.asset_type === "carbon_credit" && a.price !== null
    );
    const irecPrices = snapshot.filter(
      (a) => a.asset_type === "irec" && a.price !== null
    );

    const avgCarbonPrice =
      carbonPrices.length > 0
        ? carbonPrices.reduce((s, a) => s + Number(a.price!), 0) / carbonPrices.length
        : null;

    const avgIrecPrice =
      irecPrices.length > 0
        ? irecPrices.reduce((s, a) => s + Number(a.price!), 0) / irecPrices.length
        : null;

    return {
      totalAssets: snapshot.filter((a) => a.price !== null || a.price_display !== null).length,
      carbonCount: carbonPrices.length,
      irecCount: irecPrices.length,
      avgCarbonPrice: avgCarbonPrice ? `$${avgCarbonPrice.toFixed(2)}` : null,
      avgIrecPrice: avgIrecPrice ? `$${avgIrecPrice.toFixed(3)}` : null,
      lastUpdate: snapshot.reduce(
        (latest, a) => {
          if (a.reference_date && a.reference_date > latest) return a.reference_date;
          return latest;
        },
        ""
      ),
    };
  });
});