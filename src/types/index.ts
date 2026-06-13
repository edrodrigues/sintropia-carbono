export type UserRole = "user" | "moderator" | "admin" | "banned";
export type PostCategory = "news" | "discussion" | "question" | "help" | "link";

export const CHALLENGE_CATEGORIES = [
  "Redução de Emissões",
  "Gestão de Resíduos",
  "Eficiência Hídrica",
  "Eficiência Energética",
  "Biodiversidade",
  "Economia Circular",
  "Logística Sustentável",
  "Inovação Verde",
  "Engajamento Socioambiental",
  "Diversidade & Inclusão",
  "Direitos Humanos & Trabalho",
  "Governança & Compliance",
  "Transparência & Ética",
  "Outro",
] as const;

export type ChallengeCategory = typeof CHALLENGE_CATEGORIES[number];

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  karma: number | null;
  organization: string | null;
  cargo: string | null;
  user_type: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  headline: string | null;
  expertise_areas: string[] | null;
  certifications: string[] | null;
  years_of_experience: number | null;
  available_for_consulting: boolean | null;
  company_tagline: string | null;
  company_sector: string | null;
  company_size: string | null;
  company_cnpj: string | null;
  company_website: string | null;
  company_founded_year: number | null;
  company_geo_presence: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  content: string | null;
  url: string | null;
  category: PostCategory | string;
  keywords: string[] | null;
  karma: number | null;
  comment_count: number | null;
  is_locked: boolean | null;
  is_deleted: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PostWithRelations extends Post {
  author: {
    username: string;
    avatar_url: string | null;
    karma: number;
    linkedin_url?: string | null;
    user_type?: string | null;
  } | null;
  votes?: Vote[];
}

export interface Comment {
  id: string;
  post_id: string | null;
  challenge_id: string | null;
  author_id: string;
  content: string;
  karma: number | null;
  parent_id: string | null;
  is_deleted: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Challenge {
  id: string;
  author_id: string;
  title: string;
  category: string;
  sector: string | null;
  context: string;
  expected_result: string;
  reward: string;
  images: string[];
  comment_count: number;
  solution_comment_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChallengeWithRelations extends Challenge {
  author: {
    username: string;
    avatar_url: string | null;
    display_name: string | null;
    karma: number;
    user_type: string | null;
    company_tagline: string | null;
    company_sector: string | null;
  } | null;
  comments?: CommentWithRelations[];
  solution_comment?: {
    id: string;
    content: string;
    author: {
      username: string;
      avatar_url: string | null;
    } | null;
  } | null;
}

export interface CommentWithRelations extends Comment {
  author: {
    username: string;
    avatar_url: string | null;
    karma?: number;
    display_name?: string | null;
    linkedin_url?: string | null;
    user_type?: string | null;
  } | null;
}

export interface Vote {
  id: string;
  user_id: string;
  target_id: string;
  target_type: "post" | "comment";
  vote_type: number;
  created_at: string | null;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_id: string;
  target_type: "post" | "comment" | "profile";
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  created_at: string | null;
  reporter?: {
    username: string;
  } | null;
}

export interface Ban {
  id: string;
  user_id: string;
  moderator_id: string;
  reason: string | null;
  expires_at: string | null;
  created_at: string | null;
}

export type NotificationType = "achievement" | "system";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}
