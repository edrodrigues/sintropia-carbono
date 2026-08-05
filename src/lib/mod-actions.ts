"use server";

import { revalidatePath } from "next/cache";
import { banUserSchema, promoteToModeratorSchema, warnUserSchema, deletePostSchema } from "@/lib/validation";
import { requireAdmin, requireModerator } from "@/lib/auth/server";
import { logger } from "@/lib/utils/logger";

const BAN_DURATION_7_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function banUser(
  userId: string,
  reason: string,
  duration: "7days" | "permanent",
): Promise<{ success: boolean; error?: string }> {
  const parsed = banUserSchema.safeParse({ userId, reason, duration });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Dados inválidos" };
  }

  const auth = await requireModerator("Sem permissão para banir usuários");
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }
  const { supabase, user: currentUser } = auth;

  // A moderator must not be able to ban a moderator or an admin; only an admin
  // may act on privileged accounts.
  const { data: target } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!target) {
    return { success: false, error: "Usuário não encontrado" };
  }

  if (target.role === "admin") {
    return { success: false, error: "Não é possível banir um administrador" };
  }

  if (target.role === "moderator" && auth.role !== "admin") {
    return { success: false, error: "Apenas um administrador pode banir um moderador" };
  }

  if (userId === currentUser.id) {
    return { success: false, error: "Não é possível banir a si mesmo" };
  }

  const expiresAt = duration === "permanent"
    ? null
    : new Date(Date.now() + BAN_DURATION_7_DAYS_MS).toISOString();

  const { error: banError } = await supabase.from("bans").insert({
    user_id: userId,
    moderator_id: currentUser.id,
    reason: reason.trim(),
    expires_at: expiresAt,
  });

  if (banError) {
    logger.error("Erro ao criar banimento", { error: banError });
    return { success: false, error: "Erro ao criar banimento" };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: "banned" })
    .eq("id", userId);

  if (profileError) {
    logger.error("Erro ao atualizar perfil após banimento", { error: profileError });
    return { success: false, error: "Erro ao atualizar perfil" };
  }

  revalidatePath("/", "layout");

  return { success: true };
}

export async function promoteToModerator(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const parsed = promoteToModeratorSchema.safeParse({ userId });
  if (!parsed.success) {
    return { success: false, error: "ID de usuário inválido" };
  }

  // Granting roles is an admin-only operation. Previously any moderator could
  // promote other users, which let a moderator escalate the privileges of an
  // account they controlled.
  const auth = await requireAdmin("Apenas um administrador pode promover usuários");
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }
  const { supabase } = auth;

  const { data: targetUser } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!targetUser) {
    return { success: false, error: "Usuário não encontrado" };
  }

  if (targetUser.role === "admin") {
    return { success: false, error: "Não é possível rebaixar um administrador" };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: "moderator" })
    .eq("id", userId);

  if (updateError) {
    logger.error("Erro ao promover usuário", { error: updateError });
    return { success: false, error: "Erro ao promover usuário" };
  }

  revalidatePath("/", "layout");

  return { success: true };
}

export async function warnUser(
  userId: string,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  const parsed = warnUserSchema.safeParse({ userId, reason });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Dados inválidos" };
  }

  const auth = await requireModerator("Sem permissão para advertir usuários");
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }
  const { supabase, user: currentUser } = auth;

  const { error: warnError } = await supabase.from("warnings").insert({
    user_id: userId,
    moderator_id: currentUser.id,
    reason: reason.trim(),
  });

  if (warnError) {
    logger.error("Erro ao criar advertência", { error: warnError });
    return { success: false, error: "Erro ao criar advertência" };
  }

  revalidatePath("/", "layout");

  return { success: true };
}

export async function deletePost(
  postId: string,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  const parsed = deletePostSchema.safeParse({ postId, reason });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Dados inválidos" };
  }

  const { postId: validPostId, reason: validReason } = parsed.data;

  const auth = await requireModerator("Sem permissão para deletar posts");
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }
  const { supabase, user: currentUser } = auth;

  const { error: deleteError } = await supabase
    .from("posts")
    .update({ is_deleted: true })
    .eq("id", validPostId);

  if (deleteError) {
    logger.error("Erro ao deletar post", { error: deleteError, postId: validPostId });
    return { success: false, error: "Erro ao deletar post" };
  }

  if (validReason) {
    await supabase.from("post_deletions").insert({
      post_id: validPostId,
      moderator_id: currentUser.id,
      reason: validReason,
    });
  }

  revalidatePath("/", "layout");

  return { success: true };
}
