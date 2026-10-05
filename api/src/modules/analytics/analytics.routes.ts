import { Router } from 'express';
import { getUrlAnalyticsController } from './analytics.controller.js';

export const analyticsRouter = Router();
analyticsRouter.get('/:id/stats', getUrlAnalyticsController);
