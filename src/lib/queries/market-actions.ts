"use server";

import { requireActionUser } from "@/lib/auth/server";
import { logger } from "@/lib/utils/logger";

export async function toggleAlertActive(alertId: string, isActive: boolean) {
  // Previously unauthenticated: this action wrote to `alerts` with whatever
  // session the request carried and relied entirely on RLS. Check explicitly so
  // an unauthenticated call fails here rather than silently no-opping.
  const auth = await requireActionUser();
  if (!auth.ok) {
    return false;
  }
  const { supabase, user } = auth;

  const { error } = await supabase
    .from("alerts")
    .update({ is_active: isActive })
    .eq("id", alertId)
    .eq("user_id", user.id);

  if (error) {
    logger.error("Erro ao atualizar status do alerta", { error, alertId, userId: user.id });
    return false;
  }

  return true;
}
