export interface UserStreak {
  user_id: string;
  current_streak: number | null;
  longest_streak: number | null;
  last_activity_date: string | null;
  total_days_active: number | null;
  updated_at: string | null;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  metadata: Record<string, unknown>;
}

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ExtendedAchievement {
  id: string;
  icon: string;
  label: string;
  description: string;
  earned: boolean;
  rarity: AchievementRarity;
  progress?: {
    current: number;
    target: number;
  };
  earned_at?: string;
}

export const RARITY_COLORS: Record<AchievementRarity, { bg: string; border: string; text: string }> = {
  common: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    text: 'text-gray-700 dark:text-gray-300',
  },
  rare: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-300',
  },
  epic: {
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    border: 'border-purple-300 dark:border-purple-700',
    text: 'text-purple-700 dark:text-purple-300',
  },
  legendary: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    border: 'border-amber-400 dark:border-amber-600',
    text: 'text-amber-700 dark:text-amber-300',
  },
};

export function getStreakBonus(streak: number): number {
  if (streak <= 0) return 0;
  if (streak === 1) return 2;
  if (streak === 2) return 3;
  if (streak === 3) return 4;
  if (streak === 4) return 5;
  if (streak === 5) return 6;
  if (streak === 6) return 8;
  if (streak === 7) return 10;
  return Math.min(10 + (streak - 7), 15);
}

export function getStreakEmoji(streak: number): string {
  if (streak === 0) return '💤';
  if (streak < 3) return '🔥';
  if (streak < 7) return '🔥🔥';
  if (streak < 14) return '🔥🔥🔥';
  if (streak < 30) return '💥';
  return '🏆';
}
