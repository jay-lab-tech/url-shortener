import { Router } from 'express';
import { handleRedirect } from './redirect.controller.js';
import { rateLimit } from '../../middlewares/rateLimit.js';

export const redirectRouter = Router();
redirectRouter.get('/:shortCode', rateLimit({ keyPrefix: 'redirect', limit: 120, windowSeconds: 60 }), handleRedirect);
