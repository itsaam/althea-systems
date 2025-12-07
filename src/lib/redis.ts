import Redis from "ioredis";

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
      console.error("Redis connection error:", err.message);
    });
    
    redisInstance.on("connect", () => {
      console.log("Redis connected successfully");
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
  expire: async (key: string, seconds: number) => getRedis().expire(key, seconds),
  incr: async (key: string) => getRedis().incr(key),
  ttl: async (key: string) => getRedis().ttl(key),
  multi: () => getRedis().multi(),
};

// ==================== CACHE HELPERS ====================

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Redis getCache error for key ${key}:`, error);
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
  } catch (error) {
    console.error(`Redis setCache error for key ${key}:`, error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Redis deleteCache error for key ${key}:`, error);
  }
}

export async function clearCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(
      `Redis clearCachePattern error for pattern ${pattern}:`,
      error
    );
  }
}

// ==================== SEARCH CACHE (<100ms) ====================

const SEARCH_CACHE_PREFIX = "search:";
const SEARCH_CACHE_TTL = 300; // 5 minutes

export interface SearchCacheResult<T> {
  results: T[];
  total: number;
  cachedAt: number;
}

export async function getCachedSearch<T>(
  query: string,
  filters?: Record<string, string>
): Promise<SearchCacheResult<T> | null> {
  const cacheKey = buildSearchCacheKey(query, filters);
  return getCache<SearchCacheResult<T>>(cacheKey);
}

export async function setCachedSearch<T>(
  query: string,
  results: T[],
  total: number,
  filters?: Record<string, string>
): Promise<void> {
  const cacheKey = buildSearchCacheKey(query, filters);
  await setCache<SearchCacheResult<T>>(
    cacheKey,
    { results, total, cachedAt: Date.now() },
    SEARCH_CACHE_TTL
  );
}

export async function invalidateSearchCache(): Promise<void> {
  await clearCachePattern(`${SEARCH_CACHE_PREFIX}*`);
}

function buildSearchCacheKey(
  query: string,
  filters?: Record<string, string>
): string {
  const normalizedQuery = query.toLowerCase().trim();
  const filterString = filters
    ? Object.entries(filters)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join("_")
    : "";
  return `${SEARCH_CACHE_PREFIX}${normalizedQuery}${
    filterString ? `_${filterString}` : ""
  }`;
}

// ==================== SESSION CACHE ====================

const SESSION_PREFIX = "session:";
const SESSION_TTL = 24 * 60 * 60; // 24 heures

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  twoFactorVerified?: boolean;
  lastActivity: number;
  metadata?: Record<string, unknown>;
}

export async function getSession(
  sessionId: string
): Promise<SessionData | null> {
  return getCache<SessionData>(`${SESSION_PREFIX}${sessionId}`);
}

export async function setSession(
  sessionId: string,
  data: SessionData,
  ttl: number = SESSION_TTL
): Promise<void> {
  await setCache(`${SESSION_PREFIX}${sessionId}`, data, ttl);
}

export async function updateSessionActivity(sessionId: string): Promise<void> {
  const session = await getSession(sessionId);
  if (session) {
    session.lastActivity = Date.now();
    await setSession(sessionId, session);
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  await deleteCache(`${SESSION_PREFIX}${sessionId}`);
}

export async function getUserSessions(userId: string): Promise<string[]> {
  const keys = await redis.keys(`${SESSION_PREFIX}*`);
  const userSessions: string[] = [];

  for (const key of keys) {
    const session = await getCache<SessionData>(key);
    if (session?.userId === userId) {
      userSessions.push(key.replace(SESSION_PREFIX, ""));
    }
  }

  return userSessions;
}

export async function invalidateUserSessions(userId: string): Promise<void> {
  const sessions = await getUserSessions(userId);
  for (const sessionId of sessions) {
    await deleteSession(sessionId);
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

  // Si c'est la première requête, définir le TTL
  if (ttl === -1) {
    await redis.expire(key, windowSeconds);
    ttl = windowSeconds;
  }

  const allowed = count <= maxRequests;
  const remaining = Math.max(0, maxRequests - count);

  return { allowed, remaining, resetIn: ttl };
}

// ==================== PRODUCT CACHE ====================

const PRODUCT_CACHE_PREFIX = "product:";
const PRODUCT_CACHE_TTL = 600; // 10 minutes

export async function getCachedProduct<T>(
  productId: string
): Promise<T | null> {
  return getCache<T>(`${PRODUCT_CACHE_PREFIX}${productId}`);
}

export async function setCachedProduct<T>(
  productId: string,
  product: T
): Promise<void> {
  await setCache(
    `${PRODUCT_CACHE_PREFIX}${productId}`,
    product,
    PRODUCT_CACHE_TTL
  );
}

export async function invalidateProductCache(
  productId?: string
): Promise<void> {
  if (productId) {
    await deleteCache(`${PRODUCT_CACHE_PREFIX}${productId}`);
  } else {
    await clearCachePattern(`${PRODUCT_CACHE_PREFIX}*`);
  }
  // Invalider aussi le cache de recherche
  await invalidateSearchCache();
}

// ==================== CATEGORY CACHE ====================

const CATEGORY_CACHE_KEY = "categories:all";
const CATEGORY_CACHE_TTL = 1800; // 30 minutes

export async function getCachedCategories<T>(): Promise<T[] | null> {
  return getCache<T[]>(CATEGORY_CACHE_KEY);
}

export async function setCachedCategories<T>(categories: T[]): Promise<void> {
  await setCache(CATEGORY_CACHE_KEY, categories, CATEGORY_CACHE_TTL);
}

export async function invalidateCategoryCache(): Promise<void> {
  await deleteCache(CATEGORY_CACHE_KEY);
}
