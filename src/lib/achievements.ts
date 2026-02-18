import type { Achievement } from "@/components/profile/AchievementBadges";

interface UserStats {
  postCount: number;
  commentCount: number;
  upvotesReceived: number;
  hasLinkedIn: boolean;
  createdAt: string;
}

export function calculateAchievements(profile: {
  karma?: number;
  linkedin_url?: string | null;
  created_at?: string;
}, stats: UserStats): Achievement[] {
  const achievements: Achievement[] = [
    {
      id: "first_post",
      icon: "📝",
      label: "Primeiro Post",
      description: "Publique seu primeiro post",
      earned: stats.postCount >= 1,
      progress: { current: stats.postCount, target: 1 }
    },
    {
      id: "veteran",
      icon: "📚",
      label: "Veterano",
      description: "Publique 10 posts",
      earned: stats.postCount >= 10,
      progress: { current: stats.postCount, target: 10 }
    },
    {
      id: "influencer_post",
      icon: "🗣️",
      label: "Influenciador",
      description: "Publique 50 posts",
      earned: stats.postCount >= 50,
      progress: { current: stats.postCount, target: 50 }
    },
    {
      id: "first_comment",
      icon: "💬",
      label: "Primeiro Comentário",
      description: "Faça seu primeiro comentário",
      earned: stats.commentCount >= 1,
      progress: { current: stats.commentCount, target: 1 }
    },
    {
      id: "chatterbox",
      icon: "🔥",
      label: "Commentator",
      description: "Faça 20 comentários",
      earned: stats.commentCount >= 20,
      progress: { current: stats.commentCount, target: 20 }
    },
    {
      id: "first_upvote",
      icon: "⭐",
      label: "Upvoted",
      description: "Receba 10 upvotes",
      earned: stats.upvotesReceived >= 10,
      progress: { current: stats.upvotesReceived, target: 10 }
    },
    {
      id: "star_author",
      icon: "🌟",
      label: "Autor Estrelado",
      description: "Receba 100 upvotes",
      earned: stats.upvotesReceived >= 100,
      progress: { current: stats.upvotesReceived, target: 100 }
    },
    {
      id: "mentor",
      icon: "🎓",
      label: "Mentor",
      description: "Ajude 10 novos usuários",
      earned: stats.commentCount >= 10,
      progress: { current: stats.commentCount, target: 10 }
    },
    {
      id: "early_adopter",
      icon: "🥚",
      label: "Early Adopter",
      description: "Está desde o início",
      earned: new Date(stats.createdAt) < new Date("2025-01-01"),
    },
    {
      id: "connected",
      icon: "🤝",
      label: "Conectado",
      description: "Adicione seu LinkedIn",
      earned: !!profile.linkedin_url || stats.hasLinkedIn,
    },
  ];

  const earned = achievements.filter(a => a.earned);
  const unearned = achievements.filter(a => !a.earned);
  
  const sortedUnearned = unearned.sort((a, b) => {
    if (!a.progress || !b.progress) return 0;
    const aProgress = a.progress.current / a.progress.target;
    const bProgress = b.progress.current / b.progress.target;
    return bProgress - aProgress;
  });

  return [...earned, ...sortedUnearned];
}
