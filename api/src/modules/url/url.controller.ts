import type { RequestHandler } from 'express';
import { createUrlService } from './url.service.js';
import { createUrlSchema } from './url.schemas.js';

function prismaCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string' ? error.code : undefined;
}

export const createUrlController: RequestHandler = async (request, response, next) => {
  try {
    const parsed = createUrlSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: {
        code: 'VALIDATION_ERROR', message: 'Request tidak valid',
        details: parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
      } });
      return;
    }
    const url = await createUrlService(request.auth?.userId, parsed.data);
    response.status(201).json({ data: url });
  } catch (error) {
    if (prismaCode(error) === 'P2002') {
      response.status(409).json({ error: { code: 'ALIAS_ALREADY_EXISTS', message: 'Custom alias sudah digunakan' } });
      return;
    }
    next(error);
  }
};
