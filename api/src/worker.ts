import { prisma } from './config/database.js';
import { redis } from './config/redis.js';
import { clickWorker } from './jobs/clickWorker.js';
import { logger } from './utils/logger.js';

async function startWorker() {
  await prisma.$connect();
  await redis.connect();
  logger.info('worker_started', { queue: 'click-tracking' });
  const shutdown = async () => {
    await clickWorker.close();
    redis.disconnect();
    await prisma.$disconnect();
  };
  process.once('SIGTERM', () => void shutdown());
  process.once('SIGINT', () => void shutdown());
}

void startWorker().catch((error) => {
  logger.error('worker_start_failed', { error: error instanceof Error ? error.message : String(error) });
  process.exitCode = 1;
});
