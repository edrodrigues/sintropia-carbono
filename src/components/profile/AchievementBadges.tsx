"use client";

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
