import { z } from "zod";

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // MongoDB
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  // Redis
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),

  // OAuth (optional in dev)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),

  // Stripe
  STRIPE_PUBLIC_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  // Skip validation during build time
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    return process.env as unknown as Env;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables");
    }
    
    // En dev, on warn mais on continue
    console.warn("⚠️ Continuing with invalid env vars in development mode");
    return process.env as unknown as Env;
  }

  return parsed.data;
}

export const env = validateEnv();

// Helper pour vérifier les features disponibles
export const features = {
  hasOAuth: {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    apple: !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET),
  },
  hasStripe: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLIC_KEY),
  hasEmail: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
};
