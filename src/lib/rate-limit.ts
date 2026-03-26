import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/redis";
import { apiLogger, LogMessages } from "@/lib/logger/exports";

// ==================== TYPES ====================

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetIn: number;
}

// ==================== CONFIGURATION ====================

// Limites par methode HTTP
const METHOD_LIMITS: Record<string, RateLimitConfig> = {
  GET: { maxRequests: 100, windowSeconds: 60 },
  POST: { maxRequests: 20, windowSeconds: 60 },
  PUT: { maxRequests: 20, windowSeconds: 60 },
  PATCH: { maxRequests: 20, windowSeconds: 60 },
  DELETE: { maxRequests: 20, windowSeconds: 60 },
};

// Limites specifiques par route (prioritaire sur les limites par methode)
const ROUTE_LIMITS: Array<{ pattern: string; config: RateLimitConfig }> = [
  // Contact : 5 requetes par heure
  { pattern: "/api/contact", config: { maxRequests: 5, windowSeconds: 3600 } },
  // Auth : 5 requetes par minute
  { pattern: "/api/auth", config: { maxRequests: 5, windowSeconds: 60 } },
  { pattern: "/api/register", config: { maxRequests: 5, windowSeconds: 60 } },
  // Webhooks : pas de limite stricte (Stripe, etc.)
  { pattern: "/api/webhooks", config: { maxRequests: 200, windowSeconds: 60 } },
  // Search : 30 par minute
  { pattern: "/api/search", config: { maxRequests: 30, windowSeconds: 60 } },
  // Admin : 50 par minute
  { pattern: "/api/admin", config: { maxRequests: 50, windowSeconds: 60 } },
];

// IPs admin en whitelist (non limitees)
// Configurable via RATE_LIMIT_WHITELIST_IPS (virgule-separees)
function getWhitelistedIPs(): Set<string> {
  const envIPs = process.env.RATE_LIMIT_WHITELIST_IPS || "";
  const ips = new Set<string>(["127.0.0.1", "::1"]); // localhost toujours whitelist
  if (envIPs) {
    envIPs.split(",").forEach((ip) => ips.add(ip.trim()));
  }
  return ips;
}

// ==================== HELPERS ====================

/**
 * Extrait l'adresse IP du client depuis les headers de la requete.
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

/**
 * Determine la configuration de rate limit pour une route et methode donnees.
 * Les routes specifiques ont priorite sur les limites par methode.
 */
function getConfigForRoute(
  pathname: string,
  method: string
): { key: string; config: RateLimitConfig } {
  // Verifier les routes specifiques d'abord
  for (const route of ROUTE_LIMITS) {
    if (pathname.startsWith(route.pattern)) {
      return { key: route.pattern.replace(/\//g, ":"), config: route.config };
    }
  }

  // Sinon, utiliser les limites par methode HTTP
  const config = METHOD_LIMITS[method] || METHOD_LIMITS.GET;
  return { key: `api:${method}`, config };
}

// ==================== HEADERS ====================

/**
 * Construit les headers X-RateLimit-* a ajouter aux reponses.
 */
export function buildRateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(
      Math.floor(Date.now() / 1000) + result.resetIn
    ),
  };
}

// ==================== MIDDLEWARE ====================

/**
 * Middleware de rate limiting pour les routes API.
 *
 * Retourne :
 * - NextResponse 429 si la limite est depassee
 * - null si la requete est autorisee (les headers sont retournes via le 2e element)
 *
 * Fail-open : si Redis est indisponible, la requete passe.
 */
export async function rateLimitMiddleware(
  request: NextRequest
): Promise<{ blocked: boolean; response?: NextResponse; headers?: Record<string, string> }> {
  const pathname = request.nextUrl.pathname;
  const method = request.method;
  const clientIP = getClientIP(request);

  // Ne pas rate-limiter les assets statiques
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname.includes(".")
  ) {
    return { blocked: false };
  }

  // Whitelist IPs admins
  const whitelisted = getWhitelistedIPs();
  if (whitelisted.has(clientIP)) {
    return { blocked: false };
  }

  const { key, config } = getConfigForRoute(pathname, method);
  const rateLimitKey = `${key}:${clientIP}`;

  try {
    const result = await checkRateLimit(
      rateLimitKey,
      config.maxRequests,
      config.windowSeconds
    );

    const rateLimitResult: RateLimitResult = {
      allowed: result.allowed,
      remaining: result.remaining,
      limit: config.maxRequests,
      resetIn: result.resetIn,
    };

    const headers = buildRateLimitHeaders(rateLimitResult);

    if (!result.allowed) {
      // Logger la tentative d'abus
      apiLogger.warn(LogMessages.api.rateLimitAtteint(clientIP), {
        ip: clientIP,
        method,
        path: pathname,
        limit: config.maxRequests,
        window: config.windowSeconds,
      });

      const response = NextResponse.json(
        {
          error: "Too Many Requests",
          message: "Limite de requetes atteinte. Veuillez reessayer plus tard.",
          retryAfter: result.resetIn,
        },
        {
          status: 429,
          headers: {
            ...headers,
            "Retry-After": String(result.resetIn),
          },
        }
      );

      return { blocked: true, response };
    }

    // Requete autorisee - retourner les headers a ajouter a la reponse
    return { blocked: false, headers };
  } catch (error) {
    // Fail-open : si Redis est down, on laisse passer sans bloquer
    apiLogger.error("Rate limit check failed (fail-open)", {
      error: error instanceof Error ? error.message : "Unknown error",
      ip: clientIP,
      path: pathname,
    });
    return { blocked: false };
  }
}

// ==================== WRAPPER POUR ROUTE HANDLERS ====================

type ApiHandler = (
  req: NextRequest,
  context?: unknown
) => Promise<NextResponse>;

/**
 * Wrapper pour appliquer le rate limiting a un route handler individuel.
 * Ajoute automatiquement les headers X-RateLimit-* a la reponse.
 *
 * Usage:
 * ```ts
 * export const GET = withRateLimit(async (req) => {
 *   return NextResponse.json({ data: "..." });
 * });
 * ```
 */
export function withRateLimit(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, context?: unknown) => {
    const result = await rateLimitMiddleware(req);

    // Bloque si rate limit depasse
    if (result.blocked && result.response) {
      return result.response;
    }

    // Executer le handler
    const response = await handler(req, context);

    // Ajouter les headers de rate limit a la reponse
    if (result.headers) {
      for (const [key, value] of Object.entries(result.headers)) {
        response.headers.set(key, value);
      }
    }

    return response;
  };
}
