import type { RequestHandler } from 'express';
import { z } from 'zod';
import { findUrlsByUserId } from './url.repository.js';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const listOwnUrlsController: RequestHandler = async (request, response, next) => {
  try {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      response.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Parameter limit tidak valid' } });
      return;
    }

    if (!request.auth) {
      response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Access token diperlukan' } });
      return;
    }

    const urls = await findUrlsByUserId(request.auth.userId, parsed.data.limit);
    response.status(200).json({ data: urls, meta: { count: urls.length, limit: parsed.data.limit } });
  } catch (error) {
    next(error);
  }
};
