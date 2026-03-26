import { z } from "zod";

/**
 * Schema de validation des variables d'environnement.
 * Valide au demarrage que toutes les vars requises sont presentes.
 */
const serverEnvSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Base de donnees
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL est requise")
    .url("DATABASE_URL doit etre une URL valide"),

  // Redis
  REDIS_URL: z
    .string()
    .min(1, "REDIS_URL est requise"),

  // NextAuth
  NEXTAUTH_URL: z
    .string()
    .min(1, "NEXTAUTH_URL est requise")
    .url("NEXTAUTH_URL doit etre une URL valide"),
  NEXTAUTH_SECRET: z
    .string()
    .min(16, "NEXTAUTH_SECRET doit contenir au moins 16 caracteres"),

  // OAuth Google
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),

  // OAuth GitHub
  GITHUB_CLIENT_ID: z.string().optional().default(""),
  GITHUB_CLIENT_SECRET: z.string().optional().default(""),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional().default(""),
  RESEND_FROM_EMAIL: z.string().optional().default("onboarding@resend.dev"),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().optional().default(""),
  R2_ACCESS_KEY_ID: z.string().optional().default(""),
  R2_SECRET_ACCESS_KEY: z.string().optional().default(""),
  R2_BUCKET_NAME: z.string().optional().default("althea-images"),
  R2_PUBLIC_URL: z.string().optional().default(""),

  // Logging
  LOG_DIR: z.string().optional().default("logs"),
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "debug"])
    .optional()
    .default("debug"),

  // Entreprise (factures)
  COMPANY_NAME: z.string().optional().default("Ma Societe SAS"),
  COMPANY_ADDRESS: z.string().optional().default("12 rue de la Paix"),
  COMPANY_ZIP: z.string().optional().default("75001"),
  COMPANY_CITY: z.string().optional().default("Paris"),
  COMPANY_COUNTRY: z.string().optional().default("France"),
  COMPANY_EMAIL: z.string().optional().default("contact@masociete.fr"),
  COMPANY_PHONE: z.string().optional().default("+33 1 23 45 67 89"),
  COMPANY_SIRET: z.string().optional().default("000 000 000 00000"),
  COMPANY_VAT: z.string().optional().default("FR00000000000"),
});

/**
 * Schema pour les variables publiques (NEXT_PUBLIC_*).
 * Accessibles cote client.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_APP_URL est requise")
    .url("NEXT_PUBLIC_APP_URL doit etre une URL valide"),
  NEXT_PUBLIC_APP_NAME: z
    .string()
    .optional()
    .default("Althea Systems"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_R2_PUBLIC_URL: z.string().optional().default(""),
});

// Type derive des schemas
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Valide les variables d'environnement serveur.
 * Leve une erreur explicite au demarrage si des vars critiques manquent.
 */
function validateServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formattedErrors = Object.entries(errors)
      .map(([key, msgs]) => `  - ${key}: ${msgs?.join(", ")}`)
      .join("\n");

    console.error(
      `\n[ENV] Variables d'environnement invalides:\n${formattedErrors}\n`
    );

    // En production, on bloque le demarrage
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Variables d'environnement manquantes ou invalides:\n${formattedErrors}`
      );
    }
  }

  return result.success ? result.data : (process.env as unknown as ServerEnv);
}

/**
 * Valide les variables d'environnement client.
 */
function validateClientEnv(): ClientEnv {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
  });

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formattedErrors = Object.entries(errors)
      .map(([key, msgs]) => `  - ${key}: ${msgs?.join(", ")}`)
      .join("\n");

    console.error(
      `\n[ENV] Variables client invalides:\n${formattedErrors}\n`
    );
  }

  return result.success
    ? result.data
    : (process.env as unknown as ClientEnv);
}

// Singleton : validee une seule fois au premier import
export const serverEnv = validateServerEnv();
export const clientEnv = validateClientEnv();
