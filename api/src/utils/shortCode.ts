import { prisma } from '../config/database.js';
import { randomBase62 } from './base62.js';

export async function generateUniqueShortCode(length = 7): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const shortCode = randomBase62(length);
    const existing = await prisma.url.findUnique({ where: { shortCode }, select: { id: true } });
    if (!existing) return shortCode;
  }
  throw new Error('Gagal membuat short code unik');
}
