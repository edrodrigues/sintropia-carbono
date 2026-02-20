"use client";

import { getStreakEmoji, getStreakBonus } from "@/types/gamification";
import { Tooltip } from "@/components/ui/Tooltip";

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak?: number;
  compact?: boolean;
  showBonus?: boolean;
}

export function StreakBadge({ 
  currentStreak, 
  longestStreak, 
  compact = false,
  showBonus = false 
}: StreakBadgeProps) {
  const emoji = getStreakEmoji(currentStreak);
  const bonus = getStreakBonus(currentStreak + 1);
  
  if (compact) {
    return (
      <Tooltip content={`${currentStreak} dias consecutivos | Recorde: ${longestStreak || currentStreak} dias`}>
        <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
          <span className="text-sm animate-pulse">{emoji}</span>
          <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
            {currentStreak}
          </span>
        </div>
      </Tooltip>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200 dark:border-orange-800 p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <span className="text-2xl">{emoji}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
              {currentStreak}
            </span>
            <span className="text-sm text-orange-700 dark:text-orange-300">
              dias seguidos
            </span>
          </div>
          {longestStreak && longestStreak > currentStreak && (
            <p className="text-xs text-orange-600/70 dark:text-orange-400/70">
              Recorde: {longestStreak} dias
            </p>
          )}
        </div>
        {showBonus && currentStreak > 0 && (
          <div className="text-right">
            <span className="text-xs text-orange-600 dark:text-orange-400">Próximo bônus</span>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">+{bonus}</p>
          </div>
        )}
      </div>
      
      {currentStreak > 0 && (
        <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
          <div className="flex justify-between text-xs text-orange-600 dark:text-orange-400">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div 
                key={day}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                  ${day <= currentStreak 
                    ? 'bg-orange-400 text-white' 
                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-400'
                  }
                  ${day === 7 && day <= currentStreak ? 'ring-2 ring-yellow-400' : ''}
                `}
              >
                {day === 7 ? '🎁' : day}
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-orange-500 dark:text-orange-400/70 mt-1">
            {currentStreak < 7 
              ? `${7 - currentStreak} dias para o bônus especial!`
              : 'Bônus especial desbloqueado!'
            }
          </p>
        </div>
      )}
      
      {currentStreak === 0 && (
        <p className="text-center text-xs text-orange-600 dark:text-orange-400 mt-2">
          Acesse amanhã para começar seu streak!
        </p>
      )}
    </div>
  );
}

interface StreakDisplayProps {
  currentStreak: number;
}

export function StreakDisplay({ currentStreak }: StreakDisplayProps) {
  if (currentStreak === 0) return null;
  
  const emoji = getStreakEmoji(currentStreak);
  
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-full border border-orange-200 dark:border-orange-700">
      <span className={`text-sm ${currentStreak >= 7 ? 'animate-bounce' : ''}`}>
        {emoji}
      </span>
      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
        {currentStreak}
      </span>
    </div>
  );
}
