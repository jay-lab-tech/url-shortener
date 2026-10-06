import { prisma } from '../../config/database.js';

const urlSelect = {
  id: true,
  userId: true,
  shortCode: true,
  customAlias: true,
  originalUrl: true,
  title: true,
  expiresAt: true,
  isActive: true,
  clickCount: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function createUrl(data: {
  userId?: string;
  shortCode: string;
  customAlias?: string;
  originalUrl: string;
  title?: string;
  expiresAt?: Date;
}) {
  return prisma.url.create({ data, select: urlSelect });
}

export function findUrlsByUserId(userId: string, limit: number) {
  return prisma.url.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: urlSelect,
  });
}

export class OwnedUrlNotFoundError extends Error {
  constructor() {
    super('URL tidak ditemukan atau bukan milik user ini');
    this.name = 'OwnedUrlNotFoundError';
  }
}

export async function updateOwnedUrl(userId: string, urlId: string, data: {
  originalUrl?: string;
  title?: string | null;
  expiresAt?: Date | null;
  isActive?: boolean;
}) {
  const result = await prisma.url.updateMany({ where: { id: urlId, userId }, data });
  if (result.count === 0) throw new OwnedUrlNotFoundError();
  return prisma.url.findUniqueOrThrow({ where: { id: urlId }, select: urlSelect });
}

export function findOwnedUrlIdentifiers(userId: string, urlId: string) {
  return prisma.url.findFirst({ where: { id: urlId, userId }, select: { shortCode: true, customAlias: true } });
}
