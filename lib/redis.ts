import Redis from "ioredis";

/**
 * Singleton Redis client.
 * Uses REDIS_URL environment variable.
 */

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  if (!redis) {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }

  return redis;
}

/**
 * Generic JSON get/set helpers with optional TTL.
 */
export async function getJSON<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;

  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Redis GET error for ${key}:`, error);
    return null;
  }
}

export async function setJSON<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;

  try {
    const json = JSON.stringify(value);
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, json);
    } else {
      await client.set(key, json);
    }
    return true;
  } catch (error) {
    console.error(`Redis SET error for ${key}:`, error);
    return false;
  }
}
