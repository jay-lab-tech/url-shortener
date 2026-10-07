import { Router } from 'express';
import { optionalAuth } from '../../middlewares/optionalAuth.js';
import { getUrlAnalyticsController } from './analytics.controller.js';

export const analyticsRouter = Router();
analyticsRouter.get('/:id/stats', optionalAuth, getUrlAnalyticsController);
