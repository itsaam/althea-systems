import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/redis";

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

// Configurations par type de route
export const rateLimitConfigs = {
  // Auth routes - strict
  auth: { maxRequests: 5, windowSeconds: 60 },
  // API générales
  api: { maxRequests: 100, windowSeconds: 60 },
  // Admin API
  admin: { maxRequests: 50, windowSeconds: 60 },
  // Search
  search: { maxRequests: 30, windowSeconds: 60 },
  // Webhooks (Stripe, etc.)
  webhook: { maxRequests: 100, windowSeconds: 60 },
} as const;

export type RateLimitType = keyof typeof rateLimitConfigs;

// Obtenir l'identifiant unique du client
function getClientIdentifier(request: NextRequest): string {
  // Priorité: X-Forwarded-For > X-Real-IP > IP de connexion
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback - normalement pas atteint derrière un proxy
  return "unknown";
}

// Déterminer le type de rate limit selon la route
export function getRateLimitType(pathname: string): RateLimitType {
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/register")) {
    return "auth";
  }
  if (pathname.startsWith("/api/admin")) {
    return "admin";
  }
  if (pathname.startsWith("/api/search")) {
    return "search";
  }
  if (pathname.startsWith("/api/webhooks")) {
    return "webhook";
  }
  return "api";
}

// Middleware de rate limiting
export async function rateLimitMiddleware(
  request: NextRequest,
  type?: RateLimitType
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname;
  
  // Ne pas rate limit les assets statiques
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname.includes(".")
  ) {
    return null;
  }

  const limitType = type || getRateLimitType(pathname);
  const config = rateLimitConfigs[limitType];
  const clientId = getClientIdentifier(request);
  const key = `${limitType}:${clientId}`;

  try {
    const result = await checkRateLimit(key, config.maxRequests, config.windowSeconds);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: result.resetIn,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(result.resetIn),
            "X-RateLimit-Limit": String(config.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + result.resetIn),
          },
        }
      );
    }

    // Ajouter les headers de rate limit à la réponse (sera géré par le middleware principal)
    return null;
  } catch (error) {
    // Si Redis est down, on laisse passer (fail-open)
    console.error("Rate limit check failed:", error);
    return null;
  }
}

// Headers de rate limit pour les réponses
export function getRateLimitHeaders(
  remaining: number,
  limit: number,
  resetIn: number
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + resetIn),
  };
}
