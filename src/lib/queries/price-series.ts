import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { withMonitoring } from "@/lib/utils/monitoring";
import { logger } from "@/lib/utils/logger";

export interface PriceSeriesPoint {
  day: string;
  avg: number | null;
  min: number | null;
  max: number | null;
  count: number;
}

export const getPriceSeries = cache(async (
  assetId: string,
  days: number = 30,
) => {
  return withMonitoring(`getPriceSeries(${assetId},${days})`, async () => {
    const supabase = await createClient();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("price_series")
      .select("day, avg_price, min_price, max_price, sample_count")
      .eq("asset_id", assetId)
      .gte("day", cutoffStr)
      .order("day", { ascending: true });

    if (error) {
      logger.error("Erro ao buscar série de preços", { error, assetId });
      return [];
    }

    return (data ?? []).map((row): PriceSeriesPoint => ({
      day: row.day ?? "",
      avg: row.avg_price,
      min: row.min_price,
      max: row.max_price,
      count: row.sample_count ?? 0,
    }));
  });
});

export const getMultiAssetPriceSeries = cache(async (
  assetIds: string[],
  days: number = 30,
) => {
  return withMonitoring(`getMultiAssetPriceSeries(${assetIds.length},${days})`, async () => {
    const supabase = await createClient();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("price_series")
      .select("asset_id, day, avg_price, reference_type")
      .in("asset_id", assetIds)
      .gte("day", cutoffStr)
      .order("day", { ascending: true });

    if (error) {
      logger.error("Erro ao buscar séries multi-ativo", { error });
      return {};
    }

    const grouped: Record<string, PriceSeriesPoint[]> = {};
    for (const row of data ?? []) {
      const aid = row.asset_id ?? "";
      if (!grouped[aid]) grouped[aid] = [];
      grouped[aid].push({
        day: row.day ?? "",
        avg: row.avg_price,
        min: null,
        max: null,
        count: 0,
      });
    }
    return grouped;
  });
});
