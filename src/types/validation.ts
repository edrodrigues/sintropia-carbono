import { z } from 'zod'

export const profileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  display_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  user_type: z.enum(['individual', 'company', 'ong', 'government', 'professor']).optional(),
  cargo: z.string().max(100).optional(),
  organization: z.string().max(200).optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  twitter_url: z.string().max(100).optional().or(z.literal('')),
})

export const postSchema = z.object({
  title: z.string().min(5).max(300),
  content: z.string().max(10000).optional(),
  url: z.string().url().optional().or(z.literal('')),
  category: z.string().min(1).max(50),
  keywords: z.array(z.string()).max(10).optional(),
})

export const commentSchema = z.object({
  content: z.string().min(1).max(5000),
  post_id: z.string().uuid(),
  parent_id: z.string().uuid().optional(),
})

export const voteSchema = z.object({
  target_id: z.string().uuid(),
  target_type: z.enum(['post', 'comment']),
  vote_type: z.union([z.literal(1), z.literal(-1)]),
})

export const reportSchema = z.object({
  target_id: z.string().uuid(),
  target_type: z.enum(['post', 'comment', 'profile']),
  reason: z.string().min(10).max(1000),
})

export const banSchema = z.object({
  user_id: z.string().uuid(),
  reason: z.string().max(1000).optional(),
  expires_at: z.string().datetime().optional(),
})

export const warningSchema = z.object({
  user_id: z.string().uuid(),
  reason: z.string().min(1).max(1000),
})

export const karmaTransactionSchema = z.object({
  user_id: z.string().uuid(),
  amount: z.number().int().min(-100).max(100),
  reason: z.string().min(1).max(200),
  post_id: z.string().uuid().optional(),
})

export const userStreakSchema = z.object({
  user_id: z.string().uuid(),
  current_streak: z.number().int().min(0),
  longest_streak: z.number().int().min(0),
  last_activity_date: z.string().datetime().optional(),
  total_days_active: z.number().int().min(0),
})

export const userAchievementSchema = z.object({
  user_id: z.string().uuid(),
  achievement_id: z.string().min(1).max(100),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const carbonProjectSchema = z.object({
  project_id: z.string(),
  name: z.string().min(1).max(500),
  category: z.string().optional(),
  country: z.string().min(1).max(100),
  project_type: z.string().optional(),
  project_type_source: z.string().optional(),
  project_url: z.string().url().optional().or(z.literal('')),
  proponent: z.string().optional(),
  protocol: z.string().optional(),
  registry: z.string().optional(),
  status: z.string().optional(),
  is_compliance: z.boolean().optional(),
  issued: z.number().int().optional(),
  retired: z.number().int().optional(),
  first_issuance_at: z.string().datetime().optional(),
  first_retirement_at: z.string().datetime().optional(),
})

export const carbonCreditSchema = z.object({
  project_id: z.string().optional(),
  quantity: z.number().int().positive(),
  vintage: z.number().int().min(1990).max(2030).optional(),
  transaction_date: z.string().datetime().optional(),
  transaction_type: z.string().optional(),
  retirement_account: z.string().optional(),
  retirement_beneficiary: z.string().optional(),
  retirement_beneficiary_harmonized: z.string().optional(),
  retirement_note: z.string().optional(),
  retirement_reason: z.string().optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>
export type PostInput = z.infer<typeof postSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type VoteInput = z.infer<typeof voteSchema>
export type ReportInput = z.infer<typeof reportSchema>
export type BanInput = z.infer<typeof banSchema>
export type WarningInput = z.infer<typeof warningSchema>
export type KarmaTransactionInput = z.infer<typeof karmaTransactionSchema>
export type UserStreakInput = z.infer<typeof userStreakSchema>
export type UserAchievementInput = z.infer<typeof userAchievementSchema>
export type CarbonProjectInput = z.infer<typeof carbonProjectSchema>
export type CarbonCreditInput = z.infer<typeof carbonCreditSchema>
