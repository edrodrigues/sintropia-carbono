import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { withMonitoring } from "@/lib/utils/monitoring";
import { logger } from "@/lib/utils/logger";
import type { Database } from "@/types/supabase";

type Alert = Database["public"]["Tables"]["alerts"]["Row"];
type WatchlistItem = Database["public"]["Tables"]["watchlist_items"]["Row"];

export const getUserAlerts = cache(async (userId: string) => {
  return withMonitoring("getUserAlerts", async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Erro ao buscar alertas do usuário", { error });
      return [];
    }

    return data as Alert[];
  });
});

export const getUserWatchlist = cache(async (userId: string) => {
  return withMonitoring("getUserWatchlist", async () => {
    const supabase = await createClient();

    const { data: watchlists, error: wlError } = await supabase
      .from("watchlists")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (wlError || !watchlists || watchlists.length === 0) {
      if (wlError) logger.error("Erro ao buscar watchlists do usuário", { error: wlError });
      return [];
    }

    const watchlistId = watchlists[0].id;

    const { data: items, error: itemError } = await supabase
      .from("watchlist_items")
      .select("asset_id")
      .eq("watchlist_id", watchlistId);

    if (itemError) {
      logger.error("Erro ao buscar itens da watchlist", { error: itemError });
      return [];
    }

    return items as Pick<WatchlistItem, "asset_id">[];
  });
});

export const getUserMarketNotifications = cache(async (userId: string, limit = 10) => {
  return withMonitoring("getUserMarketNotifications", async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "system")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Erro ao buscar notificações de mercado", { error });
      return [];
    }

    return data as Database["public"]["Tables"]["notifications"]["Row"][];
  });
});
