import type { Achievement } from "@/components/profile/AchievementBadges";
import type { AchievementRarity } from "@/types/gamification";

interface UserStats {
  postCount: number;
  commentCount: number;
  upvotesReceived: number;
  hasLinkedIn: boolean;
  createdAt: string;
  streakDays?: number;
  postsWithHighUpvotes?: number;
  uniqueUsersInteracted?: number;
  totalCommentsOnPosts?: number;
  categoryPosts?: Record<string, number>;
  karma?: number;
}

interface AchievementDefinition {
  id: string;
  icon: string;
  label: string;
  description: string;
  earned: boolean;
  rarity: AchievementRarity;
  category: 'quality' | 'quantity' | 'social' | 'consistency' | 'specialization';
  progress?: {
    current: number;
    target: number;
  };
}

const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // === KARMA - Níveis ===
  {
    id: "karma_10",
    icon: "🌱",
    label: "Iniciante",
    description: "Atinga 10 pontos de karma",
    earned: false,
    rarity: "common",
    category: "quantity",
    progress: { current: 0, target: 10 }
  },
  {
    id: "karma_50",
    icon: "🌿",
    label: "Aprendiz",
    description: "Atinga 50 pontos de karma",
    earned: false,
    rarity: "common",
    category: "quantity",
    progress: { current: 0, target: 50 }
  },
  {
    id: "karma_100",
    icon: "🌟",
    label: "Contribuidor",
    description: "Atinga 100 pontos de karma",
    earned: false,
    rarity: "rare",
    category: "quantity",
    progress: { current: 0, target: 100 }
  },
  {
    id: "karma_500",
    icon: "💎",
    label: "Especialista",
    description: "Atinga 500 pontos de karma",
    earned: false,
    rarity: "epic",
    category: "quantity",
    progress: { current: 0, target: 500 }
  },
  {
    id: "karma_1000",
    icon: "👑",
    label: "Master",
    description: "Atinga 1000 pontos de karma",
    earned: false,
    rarity: "legendary",
    category: "quantity",
    progress: { current: 0, target: 1000 }
  },
  
  // === QUANTIDADE - Comum ===
  {
    id: "first_post",
    icon: "📝",
    label: "Primeiro Post",
    description: "Publique seu primeiro post",
    earned: false,
    rarity: "common",
    category: "quantity",
    progress: { current: 0, target: 1 }
  },
  {
    id: "veteran",
    icon: "📚",
    label: "Veterano",
    description: "Publique 10 posts",
    earned: false,
    rarity: "common",
    category: "quantity",
    progress: { current: 0, target: 10 }
  },
  {
    id: "influencer_post",
    icon: "🗣️",
    label: "Influenciador",
    description: "Publique 50 posts",
    earned: false,
    rarity: "rare",
    category: "quantity",
    progress: { current: 0, target: 50 }
  },
  {
    id: "content_machine",
    icon: "🤖",
    label: "Máquina de Conteúdo",
    description: "Publique 100 posts",
    earned: false,
    rarity: "epic",
    category: "quantity",
    progress: { current: 0, target: 100 }
  },
  
  // === QUANTIDADE - Comentários ===
  {
    id: "first_comment",
    icon: "💬",
    label: "Primeiro Comentário",
    description: "Faça seu primeiro comentário",
    earned: false,
    rarity: "common",
    category: "quantity",
    progress: { current: 0, target: 1 }
  },
  {
    id: "chatterbox",
    icon: "🔥",
    label: "Comentarista",
    description: "Faça 20 comentários",
    earned: false,
    rarity: "common",
    category: "quantity",
    progress: { current: 0, target: 20 }
  },
  {
    id: "conversation_master",
    icon: "🗣️",
    label: "Mestre da Conversa",
    description: "Faça 100 comentários",
    earned: false,
    rarity: "rare",
    category: "quantity",
    progress: { current: 0, target: 100 }
  },
  
  // === QUALIDADE ===
  {
    id: "first_upvote",
    icon: "⭐",
    label: "Primeira Estrela",
    description: "Receba 10 upvotes",
    earned: false,
    rarity: "common",
    category: "quality",
    progress: { current: 0, target: 10 }
  },
  {
    id: "star_author",
    icon: "🌟",
    label: "Autor Estrelado",
    description: "Receba 100 upvotes",
    earned: false,
    rarity: "rare",
    category: "quality",
    progress: { current: 0, target: 100 }
  },
  {
    id: "quality_post",
    icon: "🎯",
    label: "Atirador de Elite",
    description: "Um post com 50+ upvotes",
    earned: false,
    rarity: "rare",
    category: "quality",
    progress: { current: 0, target: 1 }
  },
  {
    id: "quality_streak",
    icon: "💎",
    label: "Conteúdo Premium",
    description: "3 posts com 20+ upvotes cada",
    earned: false,
    rarity: "epic",
    category: "quality",
    progress: { current: 0, target: 3 }
  },
  {
    id: "trend_setter",
    icon: "📈",
    label: "Trend Setter",
    description: "Um post com 100+ upvotes",
    earned: false,
    rarity: "legendary",
    category: "quality",
    progress: { current: 0, target: 1 }
  },
  {
    id: "viral_author",
    icon: "🚀",
    label: "Autor Viral",
    description: "Um post com 500+ upvotes",
    earned: false,
    rarity: "legendary",
    category: "quality",
    progress: { current: 0, target: 1 }
  },
  
  // === SOCIAL ===
  {
    id: "mentor",
    icon: "🎓",
    label: "Mentor",
    description: "Faça 10 comentários ajudando outros",
    earned: false,
    rarity: "common",
    category: "social",
    progress: { current: 0, target: 10 }
  },
  {
    id: "connected",
    icon: "🤝",
    label: "Conectado",
    description: "Adicione seu LinkedIn",
    earned: false,
    rarity: "common",
    category: "social",
  },
  {
    id: "connector",
    icon: "🌐",
    label: "Conector",
    description: "Interaja com 20 usuários diferentes",
    earned: false,
    rarity: "rare",
    category: "social",
    progress: { current: 0, target: 20 }
  },
  {
    id: "conversation_starter",
    icon: "📢",
    label: "Gerador de Debates",
    description: "Seus posts geraram 50+ comentários",
    earned: false,
    rarity: "rare",
    category: "social",
    progress: { current: 0, target: 50 }
  },
  {
    id: "community_builder",
    icon: "🏗️",
    label: "Construtor de Comunidade",
    description: "Seus posts geraram 200+ comentários",
    earned: false,
    rarity: "epic",
    category: "social",
    progress: { current: 0, target: 200 }
  },
  {
    id: "welcomer",
    icon: "👋",
    label: "Anfitrião",
    description: "Comente em posts de 10 usuários novos",
    earned: false,
    rarity: "rare",
    category: "social",
    progress: { current: 0, target: 10 }
  },
  
  // === CONSISTÊNCIA ===
  {
    id: "week_warrior",
    icon: "🔥",
    label: "Guerreiro da Semana",
    description: "Acesse 7 dias consecutivos",
    earned: false,
    rarity: "common",
    category: "consistency",
    progress: { current: 0, target: 7 }
  },
  {
    id: "fortnight_fighter",
    icon: "⚔️",
    label: "Lutador de Quinzena",
    description: "Acesse 14 dias consecutivos",
    earned: false,
    rarity: "rare",
    category: "consistency",
    progress: { current: 0, target: 14 }
  },
  {
    id: "month_master",
    icon: "📅",
    label: "Mestre do Mês",
    description: "Acesse 30 dias consecutivos",
    earned: false,
    rarity: "epic",
    category: "consistency",
    progress: { current: 0, target: 30 }
  },
  {
    id: "unstoppable",
    icon: "💪",
    label: "Imparável",
    description: "Acesse 100 dias consecutivos",
    earned: false,
    rarity: "legendary",
    category: "consistency",
    progress: { current: 0, target: 100 }
  },
  {
    id: "daily_contributor",
    icon: "📆",
    label: "Colaborador Diário",
    description: "Contribua (post/comentário) 7 dias seguidos",
    earned: false,
    rarity: "rare",
    category: "consistency",
    progress: { current: 0, target: 7 }
  },
  
  // === ESPECIALIZAÇÃO ===
  {
    id: "news_reporter",
    icon: "🗞️",
    label: "Correspondente",
    description: "10 posts na categoria 'Notícias'",
    earned: false,
    rarity: "rare",
    category: "specialization",
    progress: { current: 0, target: 10 }
  },
  {
    id: "market_analyst",
    icon: "📊",
    label: "Analista de Mercado",
    description: "10 posts na categoria 'Análises'",
    earned: false,
    rarity: "rare",
    category: "specialization",
    progress: { current: 0, target: 10 }
  },
  {
    id: "educator",
    icon: "📖",
    label: "Educador",
    description: "10 posts na categoria 'Educação'",
    earned: false,
    rarity: "rare",
    category: "specialization",
    progress: { current: 0, target: 10 }
  },
  {
    id: "polymath",
    icon: "🎓",
    label: "Polímata",
    description: "Posts em 5 categorias diferentes",
    earned: false,
    rarity: "epic",
    category: "specialization",
    progress: { current: 0, target: 5 }
  },
  {
    id: "help_seeker",
    icon: "🆘",
    label: "Buscador de Ajuda",
    description: "Poste 10 pedidos de ajuda",
    earned: false,
    rarity: "common",
    category: "specialization",
    progress: { current: 0, target: 10 }
  },
  
  // === ESPECIAL ===
  {
    id: "early_adopter",
    icon: "🥚",
    label: "Early Adopter",
    description: "Está desde o início (antes de 2025)",
    earned: false,
    rarity: "legendary",
    category: "quantity",
  },
];

export function calculateAchievements(profile: {
  karma?: number;
  linkedin_url?: string | null;
  created_at?: string;
}, stats: UserStats): Achievement[] {
  const achievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.map(def => {
    let earned = false;
    const progress = def.progress ? { ...def.progress } : undefined;
    
    switch (def.id) {
      case "first_post":
        earned = stats.postCount >= 1;
        if (progress) progress.current = stats.postCount;
        break;
      case "veteran":
        earned = stats.postCount >= 10;
        if (progress) progress.current = stats.postCount;
        break;
      case "influencer_post":
        earned = stats.postCount >= 50;
        if (progress) progress.current = stats.postCount;
        break;
      case "content_machine":
        earned = stats.postCount >= 100;
        if (progress) progress.current = stats.postCount;
        break;
      case "first_comment":
        earned = stats.commentCount >= 1;
        if (progress) progress.current = stats.commentCount;
        break;
      case "chatterbox":
        earned = stats.commentCount >= 20;
        if (progress) progress.current = stats.commentCount;
        break;
      case "conversation_master":
        earned = stats.commentCount >= 100;
        if (progress) progress.current = stats.commentCount;
        break;
      case "first_upvote":
        earned = stats.upvotesReceived >= 10;
        if (progress) progress.current = stats.upvotesReceived;
        break;
      case "star_author":
        earned = stats.upvotesReceived >= 100;
        if (progress) progress.current = stats.upvotesReceived;
        break;
      case "quality_post":
        earned = (stats.postsWithHighUpvotes || 0) >= 1;
        if (progress) progress.current = stats.postsWithHighUpvotes || 0;
        break;
      case "quality_streak":
        earned = (stats.postsWithHighUpvotes || 0) >= 3;
        if (progress) progress.current = Math.min(stats.postsWithHighUpvotes || 0, 3);
        break;
      case "trend_setter":
        earned = (stats.postsWithHighUpvotes || 0) >= 1;
        if (progress) progress.current = (stats.postsWithHighUpvotes || 0) >= 1 ? 1 : 0;
        break;
      case "connector":
        earned = (stats.uniqueUsersInteracted || 0) >= 20;
        if (progress) progress.current = stats.uniqueUsersInteracted || 0;
        break;
      case "conversation_starter":
        earned = (stats.totalCommentsOnPosts || 0) >= 50;
        if (progress) progress.current = stats.totalCommentsOnPosts || 0;
        break;
      case "community_builder":
        earned = (stats.totalCommentsOnPosts || 0) >= 200;
        if (progress) progress.current = stats.totalCommentsOnPosts || 0;
        break;
      case "week_warrior":
        earned = (stats.streakDays || 0) >= 7;
        if (progress) progress.current = stats.streakDays || 0;
        break;
      case "fortnight_fighter":
        earned = (stats.streakDays || 0) >= 14;
        if (progress) progress.current = stats.streakDays || 0;
        break;
      case "month_master":
        earned = (stats.streakDays || 0) >= 30;
        if (progress) progress.current = stats.streakDays || 0;
        break;
      case "unstoppable":
        earned = (stats.streakDays || 0) >= 100;
        if (progress) progress.current = stats.streakDays || 0;
        break;
      case "mentor":
        earned = stats.commentCount >= 10;
        if (progress) progress.current = stats.commentCount;
        break;
      // Karma achievements
      case "karma_10":
        earned = (stats.karma || 0) >= 10;
        if (progress) progress.current = stats.karma || 0;
        break;
      case "karma_50":
        earned = (stats.karma || 0) >= 50;
        if (progress) progress.current = Math.min(stats.karma || 0, 50);
        break;
      case "karma_100":
        earned = (stats.karma || 0) >= 100;
        if (progress) progress.current = Math.min(stats.karma || 0, 100);
        break;
      case "karma_500":
        earned = (stats.karma || 0) >= 500;
        if (progress) progress.current = Math.min(stats.karma || 0, 500);
        break;
      case "karma_1000":
        earned = (stats.karma || 0) >= 1000;
        if (progress) progress.current = Math.min(stats.karma || 0, 1000);
        break;
      case "early_adopter":
        earned = new Date(stats.createdAt) < new Date("2025-01-01");
        break;
      case "connected":
        earned = !!profile.linkedin_url || stats.hasLinkedIn;
        break;
      case "news_reporter":
        const newsCount = stats.categoryPosts?.['Notícias'] || stats.categoryPosts?.['noticias'] || 0;
        earned = newsCount >= 10;
        if (progress) progress.current = newsCount;
        break;
      case "market_analyst":
        const analysisCount = stats.categoryPosts?.['Análises'] || stats.categoryPosts?.['analises'] || 0;
        earned = analysisCount >= 10;
        if (progress) progress.current = analysisCount;
        break;
      case "educator":
        const eduCount = stats.categoryPosts?.['Educação'] || stats.categoryPosts?.['educacao'] || 0;
        earned = eduCount >= 10;
        if (progress) progress.current = eduCount;
        break;
      case "polymath":
        const categoryCount = stats.categoryPosts ? Object.keys(stats.categoryPosts).length : 0;
        earned = categoryCount >= 5;
        if (progress) progress.current = categoryCount;
        break;
      case "help_seeker":
        const helpCount = stats.categoryPosts?.['help'] || stats.categoryPosts?.['Pedir Ajuda'] || 0;
        earned = helpCount >= 10;
        if (progress) progress.current = helpCount;
        break;
    }
    
    return {
      id: def.id,
      icon: def.icon,
      label: def.label,
      description: def.description,
      earned,
      progress,
    };
  });

  const earnedList = achievements.filter(a => a.earned);
  const unearned = achievements.filter(a => !a.earned);
  
  const sortedUnearned = unearned.sort((a, b) => {
    if (!a.progress || !b.progress) return 0;
    const aProgress = a.progress.current / a.progress.target;
    const bProgress = b.progress.current / b.progress.target;
    return bProgress - aProgress;
  });

  return [...earnedList, ...sortedUnearned];
}

export function getAchievementRarity(achievementId: string): AchievementRarity {
  const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === achievementId);
  return def?.rarity || 'common';
}

export function getAchievementsByCategory(category: AchievementDefinition['category']): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter(d => d.category === category);
}

export function getAchievementsByRarity(rarity: AchievementRarity): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter(d => d.rarity === rarity);
}

export function getTotalAchievementsCount(): number {
  return ACHIEVEMENT_DEFINITIONS.length;
}

export { ACHIEVEMENT_DEFINITIONS };
