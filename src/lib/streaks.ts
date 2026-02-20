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
  
  return data;
}

export async function updateStreak(userId: string): Promise<{
  current_streak: number;
  longest_streak: number;
  total_days: number;
  bonus_earned: number;
} | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc('update_user_streak', {
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
      profiles!user_streaks_user_id_fkey (
        username,
        display_name
      )
    `)
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
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastDate = new Date(lastActivityDate);
  lastDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  return diffDays <= 1;
}
