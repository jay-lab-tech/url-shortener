import express from 'express';
import helmet from 'helmet';
import { prisma } from './config/database.js';
import { redis } from './config/redis.js';
import { env } from './config/env.js';
import { urlRouter } from './modules/url/url.routes.js';
import { redirectRouter } from './modules/redirect/redirect.routes.js';
import { analyticsRouter } from './modules/analytics/analytics.routes.js';
import { corsMiddleware } from './middlewares/cors.js';
import { errorHandler } from './middlewares/errorHandler.js';

export const app = express();
app.disable('x-powered-by');
app.set('trust proxy', env.TRUST_PROXY);
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: '25kb' }));
app.use('/api/urls', urlRouter);
app.use('/api/urls', analyticsRouter);

app.get('/health', async (_request, response) => {
  const [databaseCheck, redisCheck] = await Promise.allSettled([prisma.$queryRaw`SELECT 1`, redis.ping()]);
  const postgres = databaseCheck.status === 'fulfilled';
  const redisHealthy = redisCheck.status === 'fulfilled' && redisCheck.value === 'PONG';
  const healthy = postgres && redisHealthy;
  response.status(healthy ? 200 : 503).json({ data: {
    service: 'url-shortener-api', status: healthy ? 'ok' : 'degraded',
    dependencies: { postgres: postgres ? 'ok' : 'unavailable', redis: redisHealthy ? 'ok' : 'unavailable' },
  } });
});

app.use('/', redirectRouter);

app.use((_request, response) => response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route tidak ditemukan' } }));
app.use(errorHandler);
