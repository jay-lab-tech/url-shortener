import { Router } from 'express';
import { optionalAuth, requireAuth } from '../../middlewares/optionalAuth.js';
import { rateLimit } from '../../middlewares/rateLimit.js';
import { createUrlController } from './url.controller.js';
import { listOwnUrlsController } from './url.list.controller.js';
import { deleteOwnUrlController, updateOwnUrlController } from './url.manage.controller.js';

export const urlRouter = Router();
urlRouter.get('/', requireAuth, listOwnUrlsController);
urlRouter.post('/', rateLimit({ keyPrefix: 'create-url', limit: 30, windowSeconds: 60 }), optionalAuth, createUrlController);
urlRouter.patch('/:id', requireAuth, updateOwnUrlController);
urlRouter.delete('/:id', requireAuth, deleteOwnUrlController);
