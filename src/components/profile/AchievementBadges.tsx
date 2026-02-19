"use client";

import Link from "next/link";

export interface Achievement {
  id: string;
  icon: string;
  label: string;
  description: string;
  earned: boolean;
  progress?: {
    current: number;
    target: number;
  };
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  maxVisible?: number;
}

export function AchievementBadges({ achievements, maxVisible = 6 }: AchievementBadgesProps) {
  const earnedAchievements = achievements.filter((a) => a.earned);
  const unearnedAchievements = achievements.filter((a) => !a.earned);
  
  const nextAchievement = unearnedAchievements.reduce<Achievement | null>((closest, achievement) => {
    if (!achievement.progress) return closest;
    if (!closest || !closest.progress) return achievement;
    const closestProgress = closest.progress.current / closest.progress.target;
    const achievementProgress = achievement.progress.current / achievement.progress.target;
    return achievementProgress > closestProgress ? achievement : closest;
  }, null);

  const displayAchievements = [
    ...earnedAchievements.slice(0, maxVisible),
    ...(nextAchievement ? [nextAchievement] : [])
  ].slice(0, maxVisible);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3">
        {displayAchievements.map((achievement) => {
          const isEarned = achievement.earned;
          const progress = achievement.progress;
          
          return (
            <div
              key={achievement.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                isEarned
                  ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800"
                  : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-60"
              }`}
              title={achievement.description}
            >
              <span className={`text-xl ${!isEarned ? "grayscale" : ""}`} role="img" aria-label={achievement.label}>
                {achievement.icon}
              </span>
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${isEarned ? "text-amber-800 dark:text-amber-200" : "text-gray-500 dark:text-gray-400"}`}>
                  {achievement.label}
                </span>
                {!isEarned && progress && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {progress.current}/{progress.target}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        
        {achievements.length > maxVisible && (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            +{achievements.length - maxVisible} mais
          </div>
        )}
      </div>
    </div>
  );
}

interface AchievementListProps {
  achievements: Achievement[];
  maxVisible?: number;
}

export function AchievementList({ achievements, maxVisible = 6 }: AchievementListProps) {
  const earnedAchievements = achievements.filter((a) => a.earned);
  const unearnedAchievements = achievements.filter((a) => !a.earned);
  
  const sortedUnearned = [...unearnedAchievements].sort((a, b) => {
    if (!a.progress || !b.progress) return 0;
    const aProgress = a.progress.current / a.progress.target;
    const bProgress = b.progress.current / b.progress.target;
    return bProgress - aProgress;
  });

  const displayAchievements = [...earnedAchievements, ...sortedUnearned].slice(0, maxVisible);

  return (
    <div className="space-y-3">
      {displayAchievements.map((achievement) => {
        const isEarned = achievement.earned;
        const progress = achievement.progress;
        const progressPercent = progress ? Math.min((progress.current / progress.target) * 100, 100) : 0;
        
        return (
          <div
            key={achievement.id}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
              isEarned
                ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800"
                : "bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
            }`}
          >
            <span className={`text-2xl ${!isEarned ? "grayscale opacity-50" : ""}`} role="img" aria-label={achievement.label}>
              {achievement.icon}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className={`font-medium ${isEarned ? "text-amber-900 dark:text-amber-200" : "text-gray-700 dark:text-gray-300"}`}>
                  {achievement.label}
                </span>
                {isEarned && (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">Conquistado!</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{achievement.description}</p>
              {progress && !isEarned && (
                <div className="w-full">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progresso</span>
                    <span>{progress.current}/{progress.target}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {achievements.length > maxVisible && (
        <Link href="/profile" className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline mt-4">
          Ver todas as conquistas →
        </Link>
      )}
    </div>
  );
}

export const defaultAchievements: Achievement[] = [
  { id: "first_post", icon: "📝", label: "Primeiro Post", description: "Publique seu primeiro post", earned: false, progress: { current: 0, target: 1 } },
  { id: "veteran", icon: "📚", label: "Veterano", description: "Publique 10 posts", earned: false, progress: { current: 0, target: 10 } },
  { id: "first_comment", icon: "💬", label: "Primeiro Comentário", description: "Faça seu primeiro comentário", earned: false, progress: { current: 0, target: 1 } },
  { id: "chatterbox", icon: "🔥", label: "Commentator", description: "Faça 20 comentários", earned: false, progress: { current: 0, target: 20 } },
  { id: "first_upvote", icon: "⭐", label: "Upvoted", description: "Receba 10 upvotes", earned: false, progress: { current: 0, target: 10 } },
  { id: "star_author", icon: "🌟", label: "Autor Estrelado", description: "Receba 100 upvotes", earned: false, progress: { current: 0, target: 100 } },
  { id: "mentor", icon: "🎓", label: "Mentor", description: "Ajude 10 novos usuários", earned: false, progress: { current: 0, target: 10 } },
  { id: "early_adopter", icon: "🥚", label: "Early Adopter", description: "Está desde o início", earned: false },
  { id: "connected", icon: "🤝", label: "Conectado", description: "Adicione seu LinkedIn", earned: false },
];
