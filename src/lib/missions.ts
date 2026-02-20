import { createClient } from './supabase/client';
import type { WeeklyMission, MissionType } from '@/types/gamification';

const MISSION_TYPES: Array<{ type: MissionType; target: number; karma_reward: number }> = [
  { type: 'comment_5', target: 5, karma_reward: 30 },
  { type: 'post_2', target: 2, karma_reward: 50 },
  { type: 'upvote_10', target: 10, karma_reward: 20 },
  { type: 'receive_upvotes_10', target: 10, karma_reward: 25 },
  { type: 'interact_users_5', target: 5, karma_reward: 35 },
];

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export async function getUserMissions(userId: string): Promise<WeeklyMission[]> {
  const supabase = createClient();
  const weekStart = getWeekStart();
  
  const { data, error } = await supabase
    .from('weekly_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart);
  
  if (error) {
    console.error('Error fetching missions:', error);
    return [];
  }
  
  if (!data || data.length === 0) {
    await generateWeeklyMissions(userId);
    return getUserMissions(userId);
  }
  
  return data;
}

export async function generateWeeklyMissions(userId: string): Promise<boolean> {
  const supabase = createClient();
  const weekStart = getWeekStart();
  
  // Buscar dados do usuário para personalizar missões
  const { data: profile } = await supabase
    .from('profiles')
    .select('karma, created_at')
    .eq('id', userId)
    .single();
  
  const { count: postCount } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', userId)
    .eq('is_deleted', false);
  
  const { count: commentCount } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', userId)
    .eq('is_deleted', false);
  
  const karma = profile?.karma || 0;
  const userPostCount = postCount || 0;
  const userCommentCount = commentCount || 0;
  
  // Definir missões dinâmicas baseadas no progresso do usuário
  const missions: Array<{
    user_id: string;
    mission_type: MissionType;
    target: number;
    karma_reward: number;
    week_start: string;
  }> = [];
  
  // Missão: +1 post (sempre disponível se usuário tiver menos de 50 posts)
  if (userPostCount < 50) {
    missions.push({
      user_id: userId,
      mission_type: 'post_1' as MissionType,
      target: 1,
      karma_reward: 15,
      week_start: weekStart,
    });
  }
  
  // Missão: +1 comentário (sempre disponível se usuário tiver menos de 100 comentários)
  if (userCommentCount < 100) {
    missions.push({
      user_id: userId,
      mission_type: 'comment_1' as MissionType,
      target: 1,
      karma_reward: 10,
      week_start: weekStart,
    });
  }
  
  // Missão: Atingir próximo nível de karma
  const nextKarmaLevel = getNextKarmaLevel(karma);
  if (nextKarmaLevel) {
    const karmaNeeded = nextKarmaLevel - karma;
    missions.push({
      user_id: userId,
      mission_type: 'karma_level' as MissionType,
      target: Math.max(1, karmaNeeded),
      karma_reward: 30 + (karmaNeeded * 0.5),
      week_start: weekStart,
    });
  }
  
  // Missão: +3 posts (para usuários ativos)
  if (userPostCount >= 1 && userPostCount < 100) {
    missions.push({
      user_id: userId,
      mission_type: 'post_3' as MissionType,
      target: 3,
      karma_reward: 40,
      week_start: weekStart,
    });
  }
  
  // Missão: +5 comentários (para usuários ativos)
  if (userCommentCount >= 1 && userCommentCount < 150) {
    missions.push({
      user_id: userId,
      mission_type: 'comment_5' as MissionType,
      target: 5,
      karma_reward: 30,
      week_start: weekStart,
    });
  }
  
  if (missions.length === 0) {
    return true;
  }
  
  const { error } = await supabase
    .from('weekly_missions')
    .insert(missions);
  
  if (error) {
    if (error.code === '23505') return true;
    console.error('Error generating missions:', error);
    return false;
  }
  
  return true;
}

function getNextKarmaLevel(currentKarma: number): number | null {
  const levels = [10, 50, 100, 500, 1000];
  for (const level of levels) {
    if (currentKarma < level) {
      return level;
    }
  }
  return null;
}

export async function claimMissionReward(missionId: string): Promise<{
  success: boolean;
  karma_earned?: number;
  error?: string;
}> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc('claim_mission_reward', {
    p_mission_id: missionId,
  });
  
  if (error) {
    console.error('Error claiming reward:', error);
    return { success: false, error: error.message };
  }
  
  return data;
}

export async function updateMissionProgress(
  userId: string,
  missionType: MissionType,
  increment: number = 1
): Promise<boolean> {
  const supabase = createClient();
  const weekStart = getWeekStart();
  
  const { data: mission } = await supabase
    .from('weekly_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('mission_type', missionType)
    .eq('week_start', weekStart)
    .single();
  
  if (!mission) return false;
  
  const newProgress = Math.min(mission.progress + increment, mission.target);
  const completed = newProgress >= mission.target;
  
  const { error } = await supabase
    .from('weekly_missions')
    .update({ progress: newProgress, completed })
    .eq('id', mission.id);
  
  return !error;
}

export function getMissionDefinition(type: MissionType) {
  const definitions: Record<string, { label: string; description: string; icon: string }> = {
    'post_1': { label: 'Primeiro Post', description: 'Publique 1 post', icon: '📝' },
    'post_2': { label: 'Autor', description: 'Crie 2 posts', icon: '📝' },
    'post_3': { label: 'Autor Prolífico', description: 'Crie 3 posts', icon: '📝' },
    'comment_1': { label: 'Primeiro Comentário', description: 'Faça 1 comentário', icon: '💬' },
    'comment_5': { label: 'Comentarista', description: 'Faça 5 comentários', icon: '💬' },
    'karma_level': { label: 'Subir de Nível', description: 'Atinga o próximo nível de karma', icon: '⭐' },
    'upvote_10': { label: 'Apreciador', description: 'Dê 10 upvotes', icon: '👍' },
    'receive_upvotes_10': { label: 'Popular', description: 'Receba 10 upvotes', icon: '⭐' },
    'interact_users_5': { label: 'Social', description: 'Interaja com 5 usuários', icon: '🤝' },
  };
  return definitions[type] || { label: type, description: type, icon: '🎯' };
}

export function calculateWeeklyKarmaPossible(missions: WeeklyMission[]): number {
  return missions.reduce((sum, m) => sum + m.karma_reward, 0);
}

export function calculateWeeklyKarmaEarned(missions: WeeklyMission[]): number {
  return missions
    .filter(m => m.claimed)
    .reduce((sum, m) => sum + m.karma_reward, 0);
}

export function calculateWeeklyKarmaPending(missions: WeeklyMission[]): number {
  return missions
    .filter(m => m.completed && !m.claimed)
    .reduce((sum, m) => sum + m.karma_reward, 0);
}

export { MISSION_TYPES };
