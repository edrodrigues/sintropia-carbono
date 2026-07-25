import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { Database } from "@/types/supabase";

type DbMarketListing = Database["public"]["Tables"]["market_listings"]["Row"];
type DbBuyerProfile = Database["public"]["Tables"]["buyer_profiles"]["Row"];

export type MarketListingRow = Omit<DbMarketListing, "created_at" | "updated_at"> & {
  created_at: string;
  updated_at: string;
  author_username: string | null;
  author_display_name: string | null;
  author_avatar_url: string | null;
  author_user_type: string | null;
  author_karma: number | null;
  author_role: string | null;
};

export interface ListingFilters {
  side?: "supply" | "demand" | "all";
  asset_type?: "carbon_credit" | "irec" | "both";
  registry?: string;
  country?: string;
  search?: string;
}

export async function getActiveListings(filters: ListingFilters = {}): Promise<MarketListingRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("v_market_listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (filters.side === "supply" || filters.side === "demand") {
    query = query.eq("side", filters.side);
  }
  if (filters.asset_type && filters.asset_type !== "both") {
    query = query.eq("asset_type", filters.asset_type);
  }
  if (filters.registry) {
    const esc = filters.registry.replace(/"/g, '\\"');
    query = query.or(`registry.ilike.%${filters.registry}%,registries.cs.{"${esc}"}`);
  }
  if (filters.country) {
    const esc = filters.country.replace(/"/g, '\\"');
    query = query.or(`origin_country.ilike.%${filters.country}%,regions.cs.{"${esc}"}`);
  }
  if (filters.search) {
    query = query.or(`project_name.ilike.%${filters.search}%,project_registry_id.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    logger.error("Erro ao buscar market listings", { error });
    return [];
  }
  return (data ?? []) as unknown as MarketListingRow[];
}

export async function getListingById(id: string): Promise<MarketListingRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_market_listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    logger.error("Erro ao buscar listing por id", { error, id });
    return null;
  }
  return (data as unknown as MarketListingRow) ?? null;
}

export async function getMyListings(userId: string): Promise<MarketListingRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_market_listings")
    .select("*")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    logger.error("Erro ao buscar minhas listings", { error, userId });
    return [];
  }
  return (data ?? []) as unknown as MarketListingRow[];
}

export type BuyerProfileRow = DbBuyerProfile;

export async function getBuyerProfile(userId: string): Promise<BuyerProfileRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("buyer_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    logger.error("Erro ao buscar buyer profile", { error, userId });
    return null;
  }
  return (data as BuyerProfileRow) ?? null;
}
