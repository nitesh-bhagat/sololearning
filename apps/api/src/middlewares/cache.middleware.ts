import { Request, Response, NextFunction } from 'express';
import { redisService } from '../services/redis';

/**
 * Middleware to cache API responses in Redis.
 * @param ttlSeconds Time-to-live for the cache in seconds.
 * @param keyPrefix Optional custom prefix. Defaults to 'cache:'.
 */
export const cacheMiddleware = (ttlSeconds: number = 300, keyPrefix: string = 'cache:') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Construct a unique cache key based on the URL and query params
    // Include userId if present to avoid cross-user cache pollution
    const userId = (req as any).userId ? `:${(req as any).userId}` : '';
    const key = `${keyPrefix}${req.originalUrl || req.url}${userId}`;

    try {
      const cachedData = await redisService.getJson<any>(key);
      if (cachedData) {
        // Return cached data
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedData);
      }

      // If not cached, we need to intercept the response.json method
      // so we can save it to Redis before it goes out to the client.
      const originalJson = res.json.bind(res);

      res.json = (body: any) => {
        res.setHeader('X-Cache', 'MISS');
        // Save to Redis asynchronously
        redisService.setJson(key, body, ttlSeconds).catch((err) => {
          console.error('[Cache Middleware] Failed to save cache:', err);
        });

        // Call the original res.json
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error('[Cache Middleware] Error checking cache:', err);
      next(); // Proceed without caching if Redis fails
    }
  };
};
