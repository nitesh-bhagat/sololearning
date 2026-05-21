import Redis from 'ioredis';
import { env } from '@sololearning/env';

// Determine if we should attempt connection. In test environments or CI we might not have redis.
const REDIS_URL = env.REDIS_URL || 'redis://localhost:6379';

class RedisService {
  public client: Redis;

  constructor() {
    this.client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('[Redis] Max retries reached. Assuming Redis is unavailable.');
          return null; // Stop retrying
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('error', (err) => {
      console.error('[Redis Error]:', err.message);
    });

    this.client.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });
  }

  /**
   * Helper to gracefully cache JSON data
   */
  async setJson(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, data, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, data);
      }
    } catch (err) {
      console.error(`[Redis] Failed to set key ${key}:`, err);
    }
  }

  /**
   * Helper to get and parse JSON data
   */
  async getJson<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      console.error(`[Redis] Failed to get key ${key}:`, err);
      return null;
    }
  }

  /**
   * Delete keys matching a pattern (e.g. invalidating cache)
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (err) {
      console.error(`[Redis] Failed to invalidate pattern ${pattern}:`, err);
    }
  }
}

export const redisService = new RedisService();
export const redisClient = redisService.client;
