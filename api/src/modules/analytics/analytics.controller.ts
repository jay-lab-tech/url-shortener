import type { Request, Response } from 'express';
import { z } from 'zod';
import { AnalyticsNotFoundError, getUrlAnalytics } from './analytics.service.js';

const paramsSchema = z.object({ id: z.string().uuid() });

export async function getUrlAnalyticsController(request: Request, response: Response) {
  const parsed = paramsSchema.safeParse(request.params);
  if (!parsed.success) {
    return response.status(400).json({ error: { code: 'INVALID_URL_ID', message: 'ID URL tidak valid' } });
  }

  try {
    const data = await getUrlAnalytics(parsed.data.id);
    if (data.ownerId && (!request.auth || (request.auth.role !== 'ADMIN' && request.auth.userId !== data.ownerId))) {
      if (!request.auth) {
        return response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Access token diperlukan untuk analytics URL ini' } });
      }
      return response.status(403).json({ error: { code: 'FORBIDDEN', message: 'Analytics URL ini bukan milik user tersebut' } });
    }
    const { ownerId: _ownerId, ...publicData } = data;
    return response.status(200).json({ data: publicData });
  } catch (error) {
    if (error instanceof AnalyticsNotFoundError) {
      return response.status(404).json({ error: { code: 'URL_NOT_FOUND', message: error.message } });
    }
    throw error;
  }
}
