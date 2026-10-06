import { Router } from 'express';
import { optionalAuth, requireAuth } from '../../middlewares/optionalAuth.js';
import { createUrlController } from './url.controller.js';
import { listOwnUrlsController } from './url.list.controller.js';

export const urlRouter = Router();
urlRouter.get('/', requireAuth, listOwnUrlsController);
urlRouter.post('/', optionalAuth, createUrlController);
