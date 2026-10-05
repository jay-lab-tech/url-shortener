import { Router } from 'express';
import { optionalAuth } from '../../middlewares/optionalAuth.js';
import { createUrlController } from './url.controller.js';

export const urlRouter = Router();
urlRouter.post('/', optionalAuth, createUrlController);
