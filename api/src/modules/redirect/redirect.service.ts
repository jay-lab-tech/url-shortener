import { clickQueue } from '../../jobs/queue.js';
import { logger } from '../../utils/logger.js';
import { findRedirectTarget } from './redirect.repository.js';
import { cacheRedirect, getCachedRedirect } from './redirect.cache.js';

export class RedirectError extends Error {
  constructor(public readonly code: 'URL_NOT_FOUND' | 'URL_EXPIRED', message: string) {
    super(message);
    this.name = 'RedirectError';
  }
}

export async function resolveRedirect(identifier: string) {
  const cached = await getCachedRedirect(identifier);
  if (cached) {
    if (cached.expiresAt && new Date(cached.expiresAt) <= new Date()) {
      throw new RedirectError('URL_EXPIRED', 'Short URL sudah kedaluwarsa');
    }
    return { ...cached, cache: 'hit' as const };
  }

  const target = await findRedirectTarget(identifier);
  if (!target) throw new RedirectError('URL_NOT_FOUND', 'Short URL tidak ditemukan');
  if (target.expiresAt && target.expiresAt <= new Date()) {
    throw new RedirectError('URL_EXPIRED', 'Short URL sudah kedaluwarsa');
  }

  const value = {
    urlId: target.id,
    originalUrl: target.originalUrl,
    expiresAt: target.expiresAt?.toISOString() ?? null,
  };
  await cacheRedirect(identifier, value, target.expiresAt);
  return { ...value, cache: 'miss' as const };
}

export function enqueueClick(data: {
  urlId: string;
  identifier: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}) {
  void clickQueue.add('track-click', { ...data, clickedAt: new Date().toISOString() }, {
    removeOnComplete: 1000,
    removeOnFail: 5000,
  }).catch((error: unknown) => {
    logger.error('click_event_enqueue_failed', { identifier: data.identifier, error: error instanceof Error ? error.message : String(error) });
  });
}
