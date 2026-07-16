import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { withMonitoring } from "@/lib/utils/monitoring";
import { logger } from "@/lib/utils/logger";
import type { Database } from "@/types/supabase";

type MarketSnapshot = Database["public"]["Views"]["v_market_snapshot"]["Row"];
type PriceChange = Database["public"]["Views"]["v_price_changes"]["Row"];

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

export const getFeaturedPrices = cache(async () => {
  return withMonitoring("getFeaturedPrices", async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("v_market_snapshot")
      .select("*")
      .not("price", "is", null)
      .order("reference_date", { ascending: false, nullsFirst: false })
      .limit(5);

    if (error) {
      logger.error("Erro ao buscar preços em destaque", { error });
      return [];
    }
    return data as MarketSnapshot[];
  });
});

export const getLatestChanges = cache(async () => {
  return withMonitoring("getLatestChanges", async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("v_price_changes")
      .select("*")
      .not("change_pct", "is", null)
      .order("change_pct", { ascending: false, nullsFirst: false })
      .limit(5);

    if (error) {
      logger.error("Erro ao buscar variações recentes", { error });
      return [];
    }
    return data as PriceChange[];
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

export interface MarketFilters {
  assetType?: string;
  geography?: string;
  registry?: string;
  technology?: string;
  vintageYear?: number;
  currency?: string;
  referenceType?: string;
  search?: string;
}

export const getMarketByFilters = cache(async (filters: MarketFilters) => {
  return withMonitoring("getMarketByFilters", async () => {
    const supabase = await createClient();
    let query = supabase
      .from("v_market_snapshot")
      .select("*")
      .order("asset_name", { ascending: true });

    if (filters.assetType) query = query.eq("asset_type", filters.assetType);
    if (filters.geography) query = query.eq("country", filters.geography);
    if (filters.registry) query = query.eq("registry", filters.registry);
    if (filters.technology) query = query.eq("technology", filters.technology);
    if (filters.vintageYear) query = query.eq("vintage_year", filters.vintageYear);
    if (filters.currency) query = query.eq("currency", filters.currency);
    if (filters.referenceType) query = query.eq("reference_type", filters.referenceType);
    if (filters.search) {
      query = query.or(`asset_name.ilike.%${filters.search}%,country.ilike.%${filters.search}%,registry.ilike.%${filters.search}%,technology.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      logger.error("Erro ao buscar mercado com filtros", { error });
      return [];
    }
    return (data ?? []) as MarketSnapshot[];
  });
});

export const getMarketByAssetIds = cache(async (assetIds: string[]) => {
  return withMonitoring("getMarketByAssetIds", async () => {
    if (assetIds.length === 0) return [];
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("v_market_snapshot")
      .select("*")
      .in("asset_id", assetIds)
      .order("asset_name", { ascending: true });

    if (error) {
      logger.error("Erro ao buscar mercado por IDs", { error });
      return [];
    }
    return (data ?? []) as MarketSnapshot[];
  });
});

export const getDistinctFilterValues = cache(async (column: string) => {
  return withMonitoring(`getDistinctFilterValues(${column})`, async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("v_market_snapshot")
      .select(column)
      .not(column, "is", null)
      .order(column, { ascending: true });

    if (error) {
      logger.error(`Erro ao buscar valores distintos de ${column}`, { error });
      return [];
    }

     
    const rows = (data ?? []) as any[];
    const unique = [...new Set(rows.map((r) => String(r[column] ?? "")))];
    return unique.filter(Boolean);
  });
});

export const getMarketOverviewStats = cache(async () => {
  return withMonitoring("getMarketOverviewStats", async () => {
    const supabase = await createClient();

    const { data: snapshot, error: snapshotErr } = await supabase
      .from("v_market_snapshot")
      .select("*");

    if (snapshotErr) {
      logger.error("Erro ao buscar snapshot", { error: snapshotErr });
      return {
        totalAssets: 0,
        avgCarbonPrice: "—",
        avgIrecPrice: "—",
        carbonChange: null as number | null,
        irecChange: null as number | null,
        lastUpdate: "—",
      };
    }

    const items = (snapshot ?? []) as MarketSnapshot[];
    const carbonPrices = items.filter(a => a.asset_type === "carbon_credit" && a.price !== null);
    const irecPrices = items.filter(a => a.asset_type === "irec" && a.price !== null);

    const avgCarbon =
      carbonPrices.length > 0
        ? carbonPrices.reduce((s, a) => s + Number(a.price!), 0) / carbonPrices.length
        : null;
    const avgIrec =
      irecPrices.length > 0
        ? irecPrices.reduce((s, a) => s + Number(a.price!), 0) / irecPrices.length
        : null;

    const { data: changes } = await supabase
      .from("v_price_changes")
      .select("asset_type, change_pct")
      .not("change_pct", "is", null);

    const changeRows = (changes ?? []) as { asset_type: string | null; change_pct: number | null }[];

    const carbonChanges = changeRows.filter(c => c.asset_type === "carbon_credit" && c.change_pct !== null);
    const irecChanges = changeRows.filter(c => c.asset_type === "irec" && c.change_pct !== null);

    const avgCarbonChange = carbonChanges.length > 0
      ? carbonChanges.reduce((s, c) => s + Number(c.change_pct!), 0) / carbonChanges.length
      : null;
    const avgIrecChange = irecChanges.length > 0
      ? irecChanges.reduce((s, c) => s + Number(c.change_pct!), 0) / irecChanges.length
      : null;

    const lastUpdate = items.reduce(
      (latest, a) => (a.reference_date && a.reference_date > latest ? a.reference_date : latest),
      ""
    );

    return {
      totalAssets: items.filter(a => a.price !== null || a.price_display !== null).length,
      avgCarbonPrice: avgCarbon ? `$${avgCarbon.toFixed(2)}` : "—",
      avgIrecPrice: avgIrec ? `$${avgIrec.toFixed(3)}` : "—",
      carbonChange: avgCarbonChange,
      irecChange: avgIrecChange,
      lastUpdate,
    };
  });
});