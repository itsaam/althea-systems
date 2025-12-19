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

// Cache helpers
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

// Invalider toutes les sessions d'un utilisateur (via pattern de clés)
export async function invalidateUserSessions(userId: string): Promise<void> {
  const keys = await redis.keys(`session:${userId}:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Rate limiting
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