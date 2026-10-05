import type { RequestHandler } from 'express';
import { enqueueClick, RedirectError, resolveRedirect } from './redirect.service.js';

export const handleRedirect: RequestHandler = async (request, response, next) => {
  try {
    const identifier = typeof request.params.shortCode === 'string' ? request.params.shortCode : '';
    const target = await resolveRedirect(identifier);
    const userAgent = request.header('user-agent');
    const referrer = request.header('referer');
    enqueueClick({
      urlId: target.urlId,
      identifier,
      ...(request.ip ? { ipAddress: request.ip } : {}),
      ...(userAgent ? { userAgent } : {}),
      ...(referrer ? { referrer } : {}),
    });
    response.setHeader('X-Redirect-Cache', target.cache);
    response.redirect(302, target.originalUrl);
  } catch (error) {
    if (error instanceof RedirectError) {
      response.status(error.code === 'URL_EXPIRED' ? 410 : 404).json({ error: { code: error.code, message: error.message } });
      return;
    }
    next(error);
  }
};
