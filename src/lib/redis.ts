import Redis from "ioredis";

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  throw new Error("REDIS_URL is not defined");
};

export const redis = new Redis(getRedisUrl());

// Cache helpers
export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

export async function setCache<T>(
  key: string,
  value: T,
  expireSeconds: number = 3600
): Promise<void> {
  await redis.set(key, JSON.stringify(value), "EX", expireSeconds);
}

export async function deleteCache(key: string): Promise<void> {
  await redis.del(key);
}

export async function clearCachePattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
