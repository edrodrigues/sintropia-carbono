"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";
import {
  supplyListingSchema,
  demandListingSchema,
  buyerProfileSchema,
  computeListingCompleteness,
} from "@/lib/validation/market-listings";

// market_listings / buyer_profiles tables are created by a recent migration
// not yet reflected in generated Supabase types — operate on an untyped client.
type AnyClient = {
  from: (relation: string) => any;
  auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> };
};

type ActionResult = { error: string } | { success: true; id: string };

export async function createSupplyListing(raw: Record<string, unknown>): Promise<ActionResult> {
  const supabase = (await createClient()) as unknown as AnyClient;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login para criar uma listagem." };
  const userId = user.id;

  const parsed = supplyListingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados inválidos" };
  }
  const data: any = { ...parsed.data, side: "supply" };
  data.completeness_score = computeListingCompleteness("supply", parsed.data);

  const insert = {
    author_id: userId,
    side: "supply",
    status: "active",
    asset_type: data.asset_type,
    registry: data.registry,
    project_registry_id: data.project_registry_id,
    project_name: data.project_name,
    vintage: data.vintage,
    volume: data.volume,
    unit: data.unit,
    origin_country: data.origin_country,
    delivery_term: data.delivery_term,
    price_amount: data.price_amount ?? null,
    price_currency: data.price_currency ?? "USD",
    price_on_request: data.price_on_request ?? false,
    methodology: data.methodology ?? null,
    ccp_status: data.ccp_status ?? null,
    ratings: data.ratings ?? null,
    co_benefits: data.co_benefits ?? [],
    ccee_origem: data.ccee_origem ?? null,
    min_transaction_size: data.min_transaction_size ?? null,
    documentation: data.documentation ?? [],
    media_urls: data.media_urls ?? [],
    contract_type: data.contract_type ?? null,
    completeness_score: data.completeness_score,
  };

  const { data: inserted, error } = await supabase
    .from("market_listings")
    .insert(insert)
    .select("id")
    .single();

  if (error) {
    logger.error("Erro ao criar supply listing", { error, userId });
    if (error.message.includes("row-level security")) {
      return { error: "Permissão negada. Tente fazer login novamente." };
    }
    return { error: `Erro ao salvar: ${error.message}` };
  }

  revalidatePath("/carbono/mercados-ao-vivo");
  return { success: true, id: inserted.id };
}

export async function createDemandListing(raw: Record<string, unknown>): Promise<ActionResult> {
  const supabase = (await createClient()) as unknown as AnyClient;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login para criar uma listagem." };
  const userId = user.id;

  const parsed = demandListingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados inválidos" };
  }
  const data: any = { ...parsed.data, side: "demand" };
  data.completeness_score = computeListingCompleteness("demand", parsed.data);

  let buyer_profile_id: string | null = null;
  const { data: bp } = await supabase
    .from("buyer_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (bp) buyer_profile_id = bp.user_id;

  const insert = {
    author_id: userId,
    buyer_profile_id,
    side: "demand",
    status: "active",
    asset_type: data.asset_type,
    volume: data.volume ?? null,
    unit: data.unit,
    delivery_term: data.delivery_term ?? null,
    registries: data.registries ?? [],
    volume_min: data.volume_min ?? null,
    volume_max: data.volume_max ?? null,
    vintage_from: data.vintage_from ?? null,
    vintage_to: data.vintage_to ?? null,
    methodologies: data.methodologies ?? [],
    regions: data.regions ?? [],
    price_min: data.price_min ?? null,
    price_max: data.price_max ?? null,
    ccp_requirement: data.ccp_requirement ?? null,
    certifications: data.certifications ?? [],
    min_ratings: data.min_ratings ?? null,
    co_benefit_prefs: data.co_benefit_prefs ?? [],
    needs_extra_dd: data.needs_extra_dd ?? null,
    open_to_multi_year_offtake: data.open_to_multi_year_offtake ?? null,
    offtake_until_year: data.offtake_until_year ?? null,
    proposal_deadline: data.proposal_deadline ?? null,
    response_format: data.response_format ?? null,
    evaluation_criteria: data.evaluation_criteria ?? null,
    prefer_deal_room: data.prefer_deal_room ?? null,
    completeness_score: data.completeness_score,
  };

  const { data: inserted, error } = await supabase
    .from("market_listings")
    .insert(insert)
    .select("id")
    .single();

  if (error) {
    logger.error("Erro ao criar demand listing", { error, userId });
    if (error.message.includes("row-level security")) {
      return { error: "Permissão negada. Tente fazer login novamente." };
    }
    return { error: `Erro ao salvar: ${error.message}` };
  }

  revalidatePath("/carbono/mercados-ao-vivo");
  return { success: true, id: inserted.id };
}

export async function upsertBuyerProfile(raw: Record<string, unknown>) {
  const supabase = (await createClient()) as unknown as AnyClient;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login para atualizar seu perfil." };
  const userId = user.id;

  const parsed = buyerProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados de perfil de comprador inválidos" };
  }

  const { error } = await supabase
    .from("buyer_profiles")
    .upsert({
      user_id: userId,
      company_name: parsed.data.company_name ?? null,
      buyer_country: parsed.data.buyer_country ?? null,
      purchase_purpose: parsed.data.purchase_purpose ?? [],
      bought_br_credits_before: parsed.data.bought_br_credits_before ?? null,
      annual_budget_range: parsed.data.annual_budget_range ?? null,
    }, { onConflict: "user_id" });

  if (error) {
    logger.error("Erro ao salvar buyer profile", { error, userId });
    return { error: `Erro ao salvar perfil: ${error.message}` };
  }
  return { success: true };
}

export async function updateListingStatus(listingId: string, status: "active" | "paused" | "closed") {
  const supabase = (await createClient()) as unknown as AnyClient;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login." };
  const userId = user.id;

  const { error } = await supabase
    .from("market_listings")
    .update({ status })
    .eq("id", listingId)
    .eq("author_id", userId);

  if (error) {
    logger.error("Erro ao atualizar status da listing", { error, listingId, userId });
    return { error: `Erro: ${error.message}` };
  }
  revalidatePath("/carbono/mercados-ao-vivo");
  return { success: true };
}

export async function deleteListing(listingId: string) {
  const supabase = (await createClient()) as unknown as AnyClient;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login." };
  const userId = user.id;

  const { error } = await supabase
    .from("market_listings")
    .delete()
    .eq("id", listingId)
    .eq("author_id", userId);

  if (error) {
    logger.error("Erro ao deletar listing", { error, listingId, userId });
    return { error: `Erro: ${error.message}` };
  }
  revalidatePath("/carbono/mercados-ao-vivo");
  return { success: true };
}