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
