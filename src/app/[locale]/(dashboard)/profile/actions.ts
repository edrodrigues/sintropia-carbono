"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { profileUpdateSchema } from "@/lib/validation";
import { logger } from "@/lib/utils/logger";

export async function updateProfile(formData: FormData) {
  const supabase: any = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Usuário não encontrado. Faça login novamente." };
  }

  const raw = {
    username: ((formData.get("username") as string)?.trim()) || undefined,
    display_name: ((formData.get("display_name") as string)?.trim()) || undefined,
    bio: ((formData.get("bio") as string)?.trim()) || undefined,
    user_type: (formData.get("user_type") as string) || undefined,
    organization: ((formData.get("organization") as string)?.trim()) || undefined,
    cargo: ((formData.get("cargo") as string)?.trim()) || undefined,
    linkedin_url: ((formData.get("linkedin_url") as string)?.trim()) || undefined,
    twitter_url: ((formData.get("twitter_url") as string)?.trim()) || undefined,
    headline: ((formData.get("headline") as string)?.trim()) || undefined,
    expertise_areas: formData.get("expertise_areas") ? JSON.parse(formData.get("expertise_areas") as string) : undefined,
    certifications: formData.get("certifications") ? JSON.parse(formData.get("certifications") as string) : undefined,
    years_of_experience: formData.get("years_of_experience") ? Number(formData.get("years_of_experience")) : undefined,
    available_for_consulting: formData.get("available_for_consulting") === "on" ? true : undefined,
  };

  const parsed = profileUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados inválidos" };
  }

  const { username, display_name, bio, user_type, organization, cargo, linkedin_url, twitter_url, headline, expertise_areas, certifications, years_of_experience, available_for_consulting } = parsed.data;

  // Check if profile exists
  const { data: existingProfile }: any = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", user.id)
    .single();

  // Ensure username is provided if it doesn't exist yet
  if (!username && !existingProfile?.username) {
    return { error: "O nome de usuário é obrigatório." };
  }

  const updates: any = {
    id: user.id,
    username: username || existingProfile?.username || "",
    display_name: display_name || null,
    bio: bio || null,
    user_type: user_type || "individual",
    organization: organization || null,
    cargo: cargo || null,
    linkedin_url: linkedin_url || null,
    twitter_url: twitter_url || null,
    headline: headline || null,
    expertise_areas: expertise_areas || null,
    certifications: certifications || null,
    years_of_experience: years_of_experience || null,
    available_for_consulting: available_for_consulting || false,
    updated_at: new Date().toISOString(),
  };

  let error;

  if (existingProfile) {
    const result = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select();
    error = result.error;
  }
  else {
    const result = await supabase
      .from("profiles")
      .insert(updates)
      .select();
    error = result.error;
  }

  if (error) {
    logger.error("Erro ao atualizar perfil", { error, userId: user.id });

    // Check for specific error types
    if (error.message.includes("duplicate key")) {
      return { error: "Este nome de usuário já está em uso" };
    }
    if (error.message.includes("row-level security")) {
      return { error: "Permissão negada. Tente fazer login novamente." };
    }
    return { error: `Erro ao salvar: ${error.message}` };
  }

  // Check for referral reward (profile must have username + display_name after save)
  if (updates.username && updates.display_name) {
    const { data: referralInfo } = await supabase
      .from("profiles")
      .select("referred_by, referral_reward_claimed")
      .eq("id", user.id)
      .single();

    if (referralInfo?.referred_by && !referralInfo.referral_reward_claimed) {
      const { data: claimResult, error: claimError } = await supabase
        .rpc("claim_referral_reward", { p_user_id: user.id });

      if (claimError) {
        logger.error("Erro ao reivindicar referral reward", { error: claimError, userId: user.id });
      }
      else {
        logger.info("Referral reward reivindicado", { result: claimResult, userId: user.id });
      }
    }
  }

  revalidatePath("/profile");
  return { success: true };
}
