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
  };

  const parsed = profileUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados inválidos" };
  }

  const { username, display_name, bio, user_type, organization, cargo, linkedin_url, twitter_url } = parsed.data;

  // Check if profile exists
  const { data: existingProfile }: any = await supabase
    .from("profiles")
    .select("id, username, referral_reward_claimed, referred_by")
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
    updated_at: new Date().toISOString(),
  };

  let error;

  if (existingProfile) {
    // Update existing profile
    const result = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select();
    error = result.error;
  }
  else {
    // Insert new profile
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

  // Check for referral reward
  if (existingProfile?.referred_by && !existingProfile.referral_reward_claimed) {
    // If profile is now complete (has username and display name)
    if (updates.username && updates.display_name) {
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
