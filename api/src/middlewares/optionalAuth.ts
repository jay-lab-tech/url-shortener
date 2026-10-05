import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; role: 'USER' | 'ADMIN' };
    }
  }
}

export const optionalAuth: RequestHandler = (request, response, next) => {
  const authorization = request.header('authorization');
  if (!authorization) { next(); return; }
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Bearer token diperlukan' } });
    return;
  }
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'], issuer: env.JWT_ISSUER, audience: env.JWT_AUDIENCE,
    });
    if (typeof payload === 'string' || !payload.sub || (payload.role !== 'USER' && payload.role !== 'ADMIN')) {
      response.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Access token tidak valid' } });
      return;
    }
    request.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    response.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Access token tidak valid atau kedaluwarsa' } });
  }
};
