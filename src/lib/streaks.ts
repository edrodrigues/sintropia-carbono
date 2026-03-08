import { createClient } from './supabase/client';
import type { UserStreak } from '@/types/gamification';

export async function getUserStreak(userId: string): Promise<UserStreak | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching streak:', error);
    return null;
  }
  
  // Se o streak expirou (mais de 1 dia de inatividade), retornamos com current_streak 0
  if (data && !isStreakActive(data.last_activity_date)) {
    return {
      ...data,
      current_streak: 0
    };
  }
  
  return data;
}

export async function updateStreak(userId: string): Promise<{
  current_streak: number;
  longest_streak: number;
  total_days: number;
  bonus_earned: number;
} | null> {
  const supabase = createClient();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('update_user_streak', {
    p_user_id: userId,
  });
  
  if (error) {
    console.error('Error updating streak:', error);
    return null;
  }
  
  return data;
}

export async function getStreakLeaderboard(limit: number = 10): Promise<(UserStreak & { username: string; display_name: string | null })[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_streaks')
    .select(`
      *,
      profiles!user_streaks_user_id_fkey!inner (
        username,
        display_name,
        role
      )
    `)
    .neq('profiles.role', 'banned')
    .order('longest_streak', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching streak leaderboard:', error);
    return [];
  }
  
  return data.map(item => ({
    ...item,
    username: item.profiles?.username || 'Unknown',
    display_name: item.profiles?.display_name,
  }));
}

export function isStreakActive(lastActivityDate: string | null): boolean {
  if (!lastActivityDate) return false;
  
  try {
    const today = new Date();
    const lastDate = new Date(lastActivityDate);
    
    // Normalizar para o início do dia local para comparação justa
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const l = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    
    const diffTime = t.getTime() - l.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Ativo se a última atividade foi hoje (0) ou ontem (1)
    // Se for > 1, o streak expirou
    return diffDays <= 1;
  } catch (e) {
    console.error("Error parsing date in isStreakActive:", e);
    return false;
  }
}
