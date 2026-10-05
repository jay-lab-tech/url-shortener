import { prisma } from '../../config/database.js';

export function findRedirectTarget(identifier: string) {
  return prisma.url.findFirst({
    where: {
      isActive: true,
      OR: [{ shortCode: identifier }, { customAlias: identifier }],
    },
    select: { id: true, originalUrl: true, expiresAt: true },
  });
}
