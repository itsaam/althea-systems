import { z } from "zod";

/**
 * Common Zod schemas reused across API routes.
 */

// Pagination query params
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Generic ID param
export const idSchema = z.object({
  id: z.string().min(1, "ID requis"),
});

// Email field
export const emailSchema = z.string().email("Email invalide").trim().toLowerCase();

// Token field
export const tokenSchema = z.string().min(1, "Token requis");

// Profile update
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "Prénom requis").max(100).optional(),
  lastName: z.string().min(1, "Nom requis").max(100).optional(),
  phone: z.string().max(20).optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(12, "Le mot de passe doit contenir au moins 12 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(
      /[^A-Za-z0-9]/,
      "Le mot de passe doit contenir au moins un caractère spécial"
    )
    .optional(),
});

// Carousel slide
export const carouselSlideSchema = z.object({
  title: z.string().min(1, "Titre requis").max(200),
  subtitle: z.string().max(500).nullable().optional(),
  image: z.string().url("URL d'image invalide"),
  link: z.string().url("URL de lien invalide").nullable().optional(),
  order: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

// 2FA verification
export const twoFactorVerifySchema = z.object({
  code: z
    .string()
    .min(1, "Code requis")
    .max(20, "Code trop long"),
  isSetup: z.boolean().optional().default(false),
});

// Forgot password
export const forgotPasswordApiSchema = z.object({
  email: emailSchema,
});

// Verify email
export const verifyEmailSchema = z.object({
  token: tokenSchema,
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type CarouselSlideInput = z.infer<typeof carouselSlideSchema>;
