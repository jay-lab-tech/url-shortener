import { Worker } from 'bullmq';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { detectDeviceType } from '../utils/deviceType.js';

type ClickJobData = {
  urlId: string;
  identifier: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  clickedAt: string;
};

export const clickWorker = new Worker<ClickJobData>('click-tracking', async (job) => {
  logger.info('click_job_received', { jobId: job.id, name: job.name });

  const clickedAt = new Date(job.data.clickedAt);
  if (Number.isNaN(clickedAt.getTime())) {
    throw new Error(`Invalid clickedAt for job ${job.id}`);
  }

  await prisma.$transaction([
    prisma.click.create({
      data: {
        urlId: job.data.urlId,
        ipAddress: job.data.ipAddress ?? null,
        userAgent: job.data.userAgent ?? null,
        referrer: job.data.referrer ?? null,
        deviceType: detectDeviceType(job.data.userAgent),
        clickedAt,
      },
    }),
    prisma.url.update({
      where: { id: job.data.urlId },
      data: { clickCount: { increment: 1 } },
    }),
  ]);

  logger.info('click_event_persisted', {
    jobId: job.id,
    identifier: job.data.identifier,
    urlId: job.data.urlId,
  });
}, { connection: { url: env.REDIS_URL } });

clickWorker.on('completed', (job) => logger.info('click_job_completed', { jobId: job.id }));
clickWorker.on('failed', (job, error) => logger.error('click_job_failed', { jobId: job?.id, error: error.message }));
