"use server";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

export async function toggleAlertActive(alertId: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("alerts")
    .update({ is_active: isActive })
    .eq("id", alertId);

  if (error) {
    logger.error("Erro ao atualizar status do alerta", { error });
    return false;
  }

  return true;
}
