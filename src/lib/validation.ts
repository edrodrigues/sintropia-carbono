import { z } from "zod";

export const emailSchema = z.string().email("E-mail inválido").max(255);

export const passwordSchema = z.string().min(8, "Senha deve ter no mínimo 8 caracteres").max(128);

export const usernameSchema = z.string().min(3, "Username deve ter no mínimo 3 caracteres").max(30).regex(/^[a-zA-Z0-9_-]+$/, "Username deve conter apenas letras, números, _ e -");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().max(100).optional().default(""),
  username: usernameSchema.optional().default(""),
  user_type: z.enum(["individual", "company", "ong", "government", "professor"]).optional().default("individual"),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  password: passwordSchema,
});

export const profileUpdateSchema = z.object({
  username: usernameSchema.optional(),
  display_name: z.string().max(50, "Nome deve ter no máximo 50 caracteres").optional(),
  bio: z.string().max(1000, "Bio deve ter no máximo 1000 caracteres").optional(),
  user_type: z.enum(["individual", "company", "ong", "government", "professor"]).optional(),
  organization: z.string().max(100).optional(),
  cargo: z.string().max(100).optional(),
  linkedin_url: z.string().max(500).optional(),
  twitter_url: z.string().max(500).optional(),
  headline: z.string().max(150).optional(),
  expertise_areas: z.array(z.string()).max(10).optional(),
  certifications: z.array(z.string()).max(10).optional(),
  years_of_experience: z.number().int().min(0).max(70).optional(),
  available_for_consulting: z.boolean().optional(),
  company_tagline: z.string().max(150).optional(),
  company_sector: z.string().max(50).optional(),
  company_size: z.string().max(20).optional(),
  company_cnpj: z.string().max(14).optional(),
  company_website: z.string().max(500).optional(),
  company_founded_year: z.number().int().min(1900).max(2026).optional(),
  company_geo_presence: z.string().max(50).optional(),
});

export const banUserSchema = z.object({
  userId: z.string().uuid("ID de usuário inválido"),
  reason: z.string().min(1, "Motivo é obrigatório").max(500),
  duration: z.enum(["7days", "permanent"]),
});

export const promoteToModeratorSchema = z.object({
  userId: z.string().uuid("ID de usuário inválido"),
});

export const warnUserSchema = z.object({
  userId: z.string().uuid("ID de usuário inválido"),
  reason: z.string().min(1, "Motivo é obrigatório").max(500),
});

export const deletePostSchema = z.object({
  postId: z.string().uuid("ID de post inválido"),
  reason: z.string().max(500).optional().default(""),
});
