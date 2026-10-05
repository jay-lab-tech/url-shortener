import { Worker } from 'bullmq';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const clickWorker = new Worker('click-tracking', async (job) => {
  logger.info('click_job_received', { jobId: job.id, name: job.name });
}, { connection: { url: env.REDIS_URL } });

clickWorker.on('completed', (job) => logger.info('click_job_completed', { jobId: job.id }));
clickWorker.on('failed', (job, error) => logger.error('click_job_failed', { jobId: job?.id, error: error.message }));
