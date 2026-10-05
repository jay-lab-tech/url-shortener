import { Queue } from 'bullmq';
import { env } from '../config/env.js';

export const clickQueue = new Queue('click-tracking', {
  connection: { url: env.REDIS_URL },
});
