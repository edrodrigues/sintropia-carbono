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
    // Reset streak in database if expired
    await supabase
      .from('user_streaks')
      .update({ current_streak: 0 })
      .eq('user_id', userId);

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

  // After updating streak, check for achievements
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.rpc as any)('check_and_award_achievements', {
      p_user_id: userId,
    });
  } catch (err) {
    console.error('Error awarding achievements:', err);
  }
  
  return data;
}

interface StreakLeaderboardData extends UserStreak {
  profiles: {
    username: string;
    display_name: string | null;
    role: string | null;
  } | null;
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
    .order('longest_streak', { ascending: false })
    .limit(limit * 2); // Get more than needed to account for filtering
  
  if (error) {
    console.error('Error fetching streak leaderboard:', error);
    return [];
  }
  
  return (data as unknown as StreakLeaderboardData[])
    .filter(item => item.profiles?.role !== 'banned')
    .slice(0, limit)
    .map(item => ({
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
