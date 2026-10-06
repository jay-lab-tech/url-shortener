import type { RequestHandler } from 'express';
import { z } from 'zod';
import { invalidateRedirectCache } from '../redirect/redirect.cache.js';
import { findOwnedUrlIdentifiers, OwnedUrlNotFoundError, updateOwnedUrl } from './url.repository.js';
import { updateUrlSchema } from './url.schemas.js';

const paramsSchema = z.object({ id: z.string().uuid() });

export const updateOwnUrlController: RequestHandler = async (request, response, next) => {
  try {
    const params = paramsSchema.safeParse(request.params);
    const body = updateUrlSchema.safeParse(request.body);
    if (!params.success || !body.success) {
      response.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Data URL tidak valid' } });
      return;
    }
    if (!request.auth) {
      response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Access token diperlukan' } });
      return;
    }

    const identifiers = await findOwnedUrlIdentifiers(request.auth.userId, params.data.id);
    if (!identifiers) throw new OwnedUrlNotFoundError();
    const updateData = {
      ...(body.data.originalUrl !== undefined ? { originalUrl: body.data.originalUrl } : {}),
      ...(body.data.title !== undefined ? { title: body.data.title } : {}),
      ...(body.data.expiresAt !== undefined ? { expiresAt: body.data.expiresAt } : {}),
      ...(body.data.isActive !== undefined ? { isActive: body.data.isActive } : {}),
    };
    const url = await updateOwnedUrl(request.auth.userId, params.data.id, updateData);
    await invalidateRedirectCache([identifiers.shortCode, ...(identifiers.customAlias ? [identifiers.customAlias] : [])]);
    response.status(200).json({ data: url });
  } catch (error) {
    if (error instanceof OwnedUrlNotFoundError) {
      response.status(404).json({ error: { code: 'URL_NOT_FOUND', message: error.message } });
      return;
    }
    next(error);
  }
};

export const deleteOwnUrlController: RequestHandler = async (request, response, next) => {
  try {
    const params = paramsSchema.safeParse(request.params);
    if (!params.success) {
      response.status(400).json({ error: { code: 'INVALID_URL_ID', message: 'ID URL tidak valid' } });
      return;
    }
    if (!request.auth) {
      response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Access token diperlukan' } });
      return;
    }

    const identifiers = await findOwnedUrlIdentifiers(request.auth.userId, params.data.id);
    if (!identifiers) throw new OwnedUrlNotFoundError();
    const url = await updateOwnedUrl(request.auth.userId, params.data.id, { isActive: false });
    await invalidateRedirectCache([identifiers.shortCode, ...(identifiers.customAlias ? [identifiers.customAlias] : [])]);
    response.status(200).json({ data: url });
  } catch (error) {
    if (error instanceof OwnedUrlNotFoundError) {
      response.status(404).json({ error: { code: 'URL_NOT_FOUND', message: error.message } });
      return;
    }
    next(error);
  }
};
