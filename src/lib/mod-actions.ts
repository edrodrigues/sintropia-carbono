"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { banUserSchema, promoteToModeratorSchema, warnUserSchema, deletePostSchema } from "@/lib/validation";
import { logger } from "@/lib/utils/logger";

export async function banUser(
  userId: string,
  reason: string,
  duration: "7days" | "permanent",
): Promise<{ success: boolean; error?: string }> {
  const parsed = banUserSchema.safeParse({ userId, reason, duration });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Dados inválidos" };
  }

  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!currentUser) {
    return { success: false, error: "Usuário não autenticado" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (!profile || !["moderator", "admin"].includes(profile.role ?? "")) {
    return { success: false, error: "Sem permissão para banir usuários" };
  }

  const expiresAt = duration === "permanent"
    ? null
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

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

  revalidatePath("/mod");
  revalidatePath("/profiles");

  return { success: true };
}

export async function promoteToModerator(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const parsed = promoteToModeratorSchema.safeParse({ userId });
  if (!parsed.success) {
    return { success: false, error: "ID de usuário inválido" };
  }

  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!currentUser) {
    return { success: false, error: "Usuário não autenticado" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (!profile || !["moderator", "admin"].includes(profile.role ?? "")) {
    return { success: false, error: "Sem permissão para promover usuários" };
  }

  const { data: targetUser } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

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

  revalidatePath("/mod");
  revalidatePath("/profiles");

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

  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!currentUser) {
    return { success: false, error: "Usuário não autenticado" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (!profile || !["moderator", "admin"].includes(profile.role ?? "")) {
    return { success: false, error: "Sem permissão para adverti usuários" };
  }

  const { error: warnError } = await supabase.from("warnings").insert({
    user_id: userId,
    moderator_id: currentUser.id,
    reason: reason.trim(),
  });

  if (warnError) {
    logger.error("Erro ao criar advertência", { error: warnError });
    return { success: false, error: "Erro ao criar advertência" };
  }

  revalidatePath("/mod");
  revalidatePath("/profiles");

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

  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!currentUser) {
    return { success: false, error: "Usuário não autenticado" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (!profile || !["moderator", "admin"].includes(profile.role ?? "")) {
    return { success: false, error: "Sem permissão para deletar posts" };
  }

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

  revalidatePath("/mod");
  revalidatePath("/feed");

  return { success: true };
}
