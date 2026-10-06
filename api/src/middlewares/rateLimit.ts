import type { RequestHandler } from 'express';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';

type RateLimitOptions = {
  keyPrefix: string;
  limit: number;
  windowSeconds: number;
};

export function rateLimit(options: RateLimitOptions): RequestHandler {
  return async (request, response, next) => {
    const clientKey = request.ip ?? 'unknown';
    const key = `rate-limit:${options.keyPrefix}:${clientKey}`;

    try {
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, options.windowSeconds);
      const ttl = Math.max(await redis.ttl(key), 1);
      const remaining = Math.max(options.limit - count, 0);

      response.setHeader('RateLimit-Limit', options.limit);
      response.setHeader('RateLimit-Remaining', remaining);
      response.setHeader('RateLimit-Reset', Math.ceil(Date.now() / 1000) + ttl);

      if (count > options.limit) {
        response.setHeader('Retry-After', ttl);
        response.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Terlalu banyak request, coba lagi nanti' } });
        return;
      }
      next();
    } catch (error) {
      logger.error('rate_limit_unavailable', { keyPrefix: options.keyPrefix, error: error instanceof Error ? error.message : String(error) });
      next();
    }
  };
}
