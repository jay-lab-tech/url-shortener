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
    return response.status(200).json({ data });
  } catch (error) {
    if (error instanceof AnalyticsNotFoundError) {
      return response.status(404).json({ error: { code: 'URL_NOT_FOUND', message: error.message } });
    }
    throw error;
  }
}
