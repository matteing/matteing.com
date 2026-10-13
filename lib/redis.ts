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
			maxRetriesPerRequest: 1,
			connectTimeout: 3000,
			commandTimeout: 3000,
			retryStrategy: (times) => Math.min(times * 50, 2000),
		});
	}

	return redis;
}
