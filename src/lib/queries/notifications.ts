// Browser-only query module: uses the browser Supabase client and is consumed
// from client components (see NotificationBell). Do not import this from a
// server component or server action - use @/lib/supabase/server there.
import { createClient } from "@/lib/supabase/client";
import type { Notification, NotificationType } from "@/types";
import { logger } from "@/lib/utils/logger";

export async function getNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    logger.error("Erro ao buscar notificações", { error });
    return [];
  }

  return data as unknown as Notification[];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    logger.error("Erro ao buscar contagem de não lidas", { error });
    return 0;
  }

  return count || 0;
}

export async function markAsRead(notificationId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) {
    logger.error("Erro ao marcar notificação como lida", { error });
    return false;
  }

  return true;
}

export async function markAllAsRead(userId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    logger.error("Erro ao marcar todas notificações como lidas", { error });
    return false;
  }

  return true;
}

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case "achievement":
      return "🏆";
    case "system":
      return "📢";
    default:
      return "📢";
  }
}

export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
