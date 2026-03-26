import Redis from "ioredis";
import { cacheLogger, LogMessages } from "@/lib/logger/exports";

// ==================== CONNEXION REDIS ====================

// Singleton Redis instance
let redisInstance: Redis | null = null;

function getRedis(): Redis {
  if (!redisInstance) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error("REDIS_URL is not defined");
    }
    redisInstance = new Redis(url, {
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
      lazyConnect: false,
    });

    redisInstance.on("error", (err) => {
      cacheLogger.error(`Redis connection error: ${err.message}`);
    });

    redisInstance.on("connect", () => {
      cacheLogger.info("Redis connected successfully");
    });
  }
  return redisInstance;
}

// Export direct instance getter
export const redis = {
  get: async (key: string) => getRedis().get(key),
  set: async (key: string, value: string, mode?: string, duration?: number) => {
    if (mode === "EX" && duration) {
      return getRedis().set(key, value, "EX", duration);
    }
    return getRedis().set(key, value);
  },
  del: async (...keys: string[]) => getRedis().del(...keys),
  keys: async (pattern: string) => getRedis().keys(pattern),
  expire: async (key: string, seconds: number) =>
    getRedis().expire(key, seconds),
  incr: async (key: string) => getRedis().incr(key),
  ttl: async (key: string) => getRedis().ttl(key),
  multi: () => getRedis().multi(),
};

// ==================== TTL CONFIGURATION ====================

/**
 * TTL par type de donnee (en secondes).
 * Centralise pour coherence a travers tout le projet.
 */
export const CACHE_TTL = {
  /** Produit individuel : 1 heure */
  product: 3600,
  /** Liste de produits : 1 heure */
  products: 3600,
  /** Categorie individuelle : 2 heures */
  category: 7200,
  /** Liste de categories : 2 heures */
  categories: 7200,
  /** Resultats de recherche : 5 minutes */
  search: 300,
  /** Donnees homepage : 10 minutes */
  homepage: 600,
  /** Session utilisateur : 24 heures */
  session: 86400,
} as const;

/**
 * Prefixes de cles cache.
 * Format standardise : prefix:id
 */
export const CACHE_KEYS = {
  product: (id: string) => `product:${id}`,
  products: (page?: number, filters?: string) =>
    `products:list:${page || 0}:${filters || "all"}`,
  category: (id: string) => `category:${id}`,
  categories: () => "categories:all",
  search: (hash: string) => `search:${hash}`,
  homepage: () => "homepage:data",
} as const;

// ==================== MONITORING HITS/MISS ====================

/**
 * Compteurs en memoire pour le monitoring des hits/miss.
 * Reinitialises a chaque redemarrage du serveur.
 */
const cacheStats = {
  hits: 0,
  misses: 0,
};

/**
 * Retourne les statistiques de cache (hits, misses, ratio).
 */
export function getCacheStats(): {
  hits: number;
  misses: number;
  total: number;
  hitRate: string;
} {
  const total = cacheStats.hits + cacheStats.misses;
  const hitRate =
    total > 0 ? ((cacheStats.hits / total) * 100).toFixed(1) + "%" : "N/A";
  return { hits: cacheStats.hits, misses: cacheStats.misses, total, hitRate };
}

/**
 * Remet les compteurs a zero.
 */
export function resetCacheStats(): void {
  cacheStats.hits = 0;
  cacheStats.misses = 0;
}

// ==================== CACHE HELPERS DE BASE ====================

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (!data) {
      cacheStats.misses++;
      cacheLogger.debug(LogMessages.cache.miss(key));
      return null;
    }
    cacheStats.hits++;
    cacheLogger.debug(LogMessages.cache.hit(key));
    return JSON.parse(data) as T;
  } catch (error) {
    cacheStats.misses++;
    cacheLogger.error(`Redis getCache error for key ${key}: ${error}`);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  expireSeconds: number = 3600
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", expireSeconds);
    cacheLogger.debug(LogMessages.cache.set(key, expireSeconds));
  } catch (error) {
    cacheLogger.error(`Redis setCache error for key ${key}: ${error}`);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
    cacheLogger.debug(LogMessages.cache.delete(key));
  } catch (error) {
    cacheLogger.error(`Redis deleteCache error for key ${key}: ${error}`);
  }
}

export async function clearCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      cacheLogger.debug(LogMessages.cache.clear(pattern));
    }
  } catch (error) {
    cacheLogger.error(
      `Redis clearCachePattern error for pattern ${pattern}: ${error}`
    );
  }
}

// ==================== CACHE-ASIDE PATTERN ====================

/**
 * Cache-aside pattern : recupere depuis le cache ou execute le fetcher.
 *
 * 1. Verifie le cache Redis
 * 2. Si hit -> retourne la donnee cachee
 * 3. Si miss -> execute le fetcher, stocke en cache, retourne la donnee
 *
 * Fail-safe : si Redis est down, le fetcher est execute directement.
 *
 * @param key - Cle Redis
 * @param fetcher - Fonction asynchrone qui recupere la donnee fraiche
 * @param ttl - Duree de vie en secondes (defaut: 3600)
 *
 * @example
 * ```ts
 * const product = await getCachedOrFetch(
 *   CACHE_KEYS.product(id),
 *   () => prisma.product.findUnique({ where: { id } }),
 *   CACHE_TTL.product
 * );
 * ```
 */
export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // Tenter de recuperer depuis le cache
  try {
    const cached = await getCache<T>(key);
    if (cached !== null) {
      return cached;
    }
  } catch {
    // Cache indisponible, on continue vers le fetcher
  }

  // Cache miss : executer le fetcher
  const data = await fetcher();

  // Stocker en cache (fire-and-forget, ne bloque pas la reponse)
  if (data !== null && data !== undefined) {
    setCache(key, data, ttl).catch(() => {
      // Ignorer les erreurs de cache silencieusement
    });
  }

  return data;
}

// ==================== INVALIDATION AUTO ====================

/**
 * Invalide le cache d'un produit et des listes associees.
 * A appeler apres POST/PUT/DELETE sur un produit.
 */
export async function invalidateProductCache(productId?: string): Promise<void> {
  const promises: Promise<void>[] = [];

  if (productId) {
    promises.push(deleteCache(CACHE_KEYS.product(productId)));
  }

  // Invalider toutes les listes de produits
  promises.push(clearCachePattern("products:list:*"));
  // Invalider la homepage (contient des produits)
  promises.push(deleteCache(CACHE_KEYS.homepage()));
  // Invalider les resultats de recherche (peuvent contenir ce produit)
  promises.push(clearCachePattern("search:*"));

  await Promise.allSettled(promises);
  cacheLogger.info(
    `Product cache invalidated${productId ? ` for ${productId}` : " (all)"}`
  );
}

/**
 * Invalide le cache des categories et des listes associees.
 * A appeler apres POST/PUT/DELETE sur une categorie.
 */
export async function invalidateCategoryCache(
  categoryId?: string
): Promise<void> {
  const promises: Promise<void>[] = [];

  if (categoryId) {
    promises.push(deleteCache(CACHE_KEYS.category(categoryId)));
  }

  promises.push(deleteCache(CACHE_KEYS.categories()));
  // Les categories impactent aussi la homepage
  promises.push(deleteCache(CACHE_KEYS.homepage()));

  await Promise.allSettled(promises);
  cacheLogger.info(
    `Category cache invalidated${categoryId ? ` for ${categoryId}` : " (all)"}`
  );
}

/**
 * Invalide tout le cache de la homepage.
 */
export async function invalidateHomepageCache(): Promise<void> {
  await deleteCache(CACHE_KEYS.homepage());
  cacheLogger.info("Homepage cache invalidated");
}

// ==================== SESSIONS ====================

export async function invalidateUserSessions(userId: string): Promise<void> {
  const keys = await redis.keys(`session:${userId}:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// ==================== RATE LIMITING ====================

const RATE_LIMIT_PREFIX = "ratelimit:";

export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const key = `${RATE_LIMIT_PREFIX}${identifier}`;

  const multi = redis.multi();
  multi.incr(key);
  multi.ttl(key);

  const results = await multi.exec();

  if (!results) {
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetIn: windowSeconds,
    };
  }

  const count = results[0]?.[1] as number;
  let ttl = results[1]?.[1] as number;

  // Si c'est la premiere requete, definir le TTL
  if (ttl === -1) {
    await redis.expire(key, windowSeconds);
    ttl = windowSeconds;
  }

  const allowed = count <= maxRequests;
  const remaining = Math.max(0, maxRequests - count);

  return { allowed, remaining, resetIn: ttl };
}
