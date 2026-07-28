"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";
import type { Json } from "@/types/supabase";
import {
  supplyListingSchema,
  demandListingSchema,
  buyerProfileSchema,
  computeListingCompleteness,
} from "@/lib/validation/market-listings";

type ActionResult = { error: string } | { success: true; id: string };

export async function createSupplyListing(raw: Record<string, unknown>): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login para criar uma listagem." };
  const userId = user.id;

  const parsed = supplyListingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados inválidos" };
  }
  const d = parsed.data;
  const completeness_score = computeListingCompleteness("supply", parsed.data);

  const insert = {
    author_id: userId,
    side: "supply" as const,
    status: "active" as const,
    asset_type: d.asset_type,
    registry: d.registry,
    project_registry_id: d.project_registry_id,
    project_name: d.project_name,
    vintage: d.vintage,
    volume: d.volume,
    unit: d.unit,
    origin_country: d.origin_country,
    delivery_term: d.delivery_term,
    price_amount: d.price_amount ?? null,
    price_currency: d.price_currency ?? "USD",
    price_on_request: d.price_on_request ?? false,
    methodology: d.methodology ?? null,
    ccp_status: d.ccp_status ?? null,
    ratings: (d.ratings ?? null) as Json,
    co_benefits: d.co_benefits ?? [],
    ccee_origem: d.ccee_origem ?? null,
    min_transaction_size: d.min_transaction_size ?? null,
    documentation: d.documentation ?? [],
    media_urls: d.media_urls ?? [],
    contract_type: d.contract_type ?? null,
    completeness_score,
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login para criar uma listagem." };
  const userId = user.id;

  const parsed = demandListingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados inválidos" };
  }
  const d = parsed.data;
  const completeness_score = computeListingCompleteness("demand", parsed.data);

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
    side: "demand" as const,
    status: "active" as const,
    asset_type: d.asset_type,
    volume: d.volume ?? null,
    unit: d.unit,
    delivery_term: d.delivery_term ?? null,
    registries: d.registries ?? [],
    volume_min: d.volume_min ?? null,
    volume_max: d.volume_max ?? null,
    vintage_from: d.vintage_from ?? null,
    vintage_to: d.vintage_to ?? null,
    methodologies: d.methodologies ?? [],
    regions: d.regions ?? [],
    price_min: d.price_min ?? null,
    price_max: d.price_max ?? null,
    ccp_requirement: d.ccp_requirement ?? null,
    certifications: d.certifications ?? [],
    min_ratings: (d.min_ratings ?? null) as Json,
    co_benefit_prefs: d.co_benefit_prefs ?? [],
    needs_extra_dd: d.needs_extra_dd ?? null,
    open_to_multi_year_offtake: d.open_to_multi_year_offtake ?? null,
    offtake_until_year: d.offtake_until_year ?? null,
    proposal_deadline: d.proposal_deadline ?? null,
    response_format: d.response_format ?? null,
    evaluation_criteria: (d.evaluation_criteria ?? null) as Json,
    prefer_deal_room: d.prefer_deal_room ?? null,
    completeness_score,
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
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
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
