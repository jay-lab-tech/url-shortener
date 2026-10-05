import { redis } from '../../config/redis.js';

const CACHE_TTL_SECONDS = 24 * 60 * 60;

export type CachedRedirect = {
  urlId: string;
  originalUrl: string;
  expiresAt: string | null;
};

function cacheKey(identifier: string) {
  return `url:${identifier}`;
}

export async function getCachedRedirect(identifier: string) {
  const cached = await redis.get(cacheKey(identifier));
  if (!cached) return null;
  try {
    return JSON.parse(cached) as CachedRedirect;
  } catch {
    await redis.del(cacheKey(identifier));
    return null;
  }
}

export function cacheRedirect(identifier: string, value: CachedRedirect, expiresAt: Date | null) {
  const expiresIn = expiresAt
    ? Math.min(CACHE_TTL_SECONDS, Math.max(Math.ceil((expiresAt.getTime() - Date.now()) / 1000), 1))
    : CACHE_TTL_SECONDS;
  return redis.set(cacheKey(identifier), JSON.stringify(value), 'EX', expiresIn);
}
