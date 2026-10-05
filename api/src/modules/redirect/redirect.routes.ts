import { Router } from 'express';
import { handleRedirect } from './redirect.controller.js';

export const redirectRouter = Router();
redirectRouter.get('/:shortCode', handleRedirect);
