import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

// Tables/view created by 20260725000000_market_listings.sql are not yet in
// generated types (supabase.ts). Cast the typed client to any locally.
type AnyClient = {
  from: (relation: string) => any;
};

export type MarketListingRow = {
  id: string;
  author_id: string;
  buyer_profile_id: string | null;
  side: "supply" | "demand";
  status: string;
  asset_type: string;
  volume: number | null;
  unit: string | null;
  delivery_term: string | null;
  registry: string | null;
  project_registry_id: string | null;
  project_name: string | null;
  vintage: number | null;
  origin_country: string | null;
  price_amount: number | null;
  price_currency: string | null;
  price_on_request: boolean | null;
  methodology: string | null;
  ccp_status: string | null;
  ratings: Record<string, unknown> | null;
  co_benefits: string[] | null;
  ccee_origem: string | null;
  min_transaction_size: number | null;
  documentation: string[] | null;
  media_urls: string[] | null;
  contract_type: string | null;
  registries: string[] | null;
  volume_min: number | null;
  volume_max: number | null;
  vintage_from: number | null;
  vintage_to: number | null;
  methodologies: string[] | null;
  regions: string[] | null;
  price_min: number | null;
  price_max: number | null;
  ccp_requirement: string | null;
  certifications: string[] | null;
  min_ratings: Record<string, unknown> | null;
  co_benefit_prefs: string[] | null;
  needs_extra_dd: boolean | null;
  open_to_multi_year_offtake: boolean | null;
  offtake_until_year: number | null;
  proposal_deadline: string | null;
  response_format: string | null;
  evaluation_criteria: Record<string, unknown> | null;
  prefer_deal_room: boolean | null;
  completeness_score: number | null;
  expires_at: string | null;
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
  const supabase = (await createClient()) as unknown as AnyClient;
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
    query = query.or(`registry.ilike.%${filters.registry}%,registries.cs.{${filters.registry}}`);
  }
  if (filters.country) {
    query = query.or(`origin_country.ilike.%${filters.country}%,regions.cs.{${filters.country}}`);
  }
  if (filters.search) {
    query = query.or(`project_name.ilike.%${filters.search}%,project_registry_id.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    logger.error("Erro ao buscar market listings", { error });
    return [];
  }
  return data as unknown as MarketListingRow[];
}

export async function getListingById(id: string): Promise<MarketListingRow | null> {
  const supabase = (await createClient()) as unknown as AnyClient;
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
  const supabase = (await createClient()) as unknown as AnyClient;
  const { data, error } = await supabase
    .from("v_market_listings")
    .select("*")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    logger.error("Erro ao buscar minhas listings", { error, userId });
    return [];
  }
  return data as unknown as MarketListingRow[];
}

export interface BuyerProfileRow {
  user_id: string;
  company_name: string | null;
  buyer_country: string | null;
  purchase_purpose: string[] | null;
  bought_br_credits_before: boolean | null;
  annual_budget_range: string | null;
}

export async function getBuyerProfile(userId: string): Promise<BuyerProfileRow | null> {
  const supabase = (await createClient()) as unknown as AnyClient;
  const { data, error } = await supabase
    .from("buyer_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    logger.error("Erro ao buscar buyer profile", { error, userId });
    return null;
  }
  return (data as unknown as BuyerProfileRow) ?? null;
}