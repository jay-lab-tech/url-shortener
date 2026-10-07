import { prisma } from '../../config/database.js';

const analyticsUrlSelect = {
  id: true,
  userId: true,
  shortCode: true,
  customAlias: true,
  originalUrl: true,
  title: true,
  clickCount: true,
  createdAt: true,
} as const;

export type DailyClickRow = {
  day: string;
  clicks: bigint;
};

export type GroupedClickRow = {
  value: string;
  clicks: bigint;
};

export function findUrlForAnalytics(urlId: string) {
  return prisma.url.findUnique({ where: { id: urlId }, select: analyticsUrlSelect });
}

export function countClicksByDay(urlId: string) {
  return prisma.$queryRaw<DailyClickRow[]>`
    SELECT TO_CHAR(DATE_TRUNC('day', "clickedAt"), 'YYYY-MM-DD') AS day,
           COUNT(*)::bigint AS clicks
    FROM "Click"
    WHERE "urlId" = ${urlId}::uuid
    GROUP BY DATE_TRUNC('day', "clickedAt")
    ORDER BY day ASC
  `;
}

export function countClicksByDevice(urlId: string) {
  return prisma.$queryRaw<GroupedClickRow[]>`
    SELECT "deviceType" AS value, COUNT(*)::bigint AS clicks
    FROM "Click"
    WHERE "urlId" = ${urlId}::uuid AND "deviceType" IS NOT NULL
    GROUP BY "deviceType"
    ORDER BY clicks DESC
  `;
}

export function countClicksByReferrer(urlId: string) {
  return prisma.$queryRaw<GroupedClickRow[]>`
    SELECT "referrer" AS value, COUNT(*)::bigint AS clicks
    FROM "Click"
    WHERE "urlId" = ${urlId}::uuid AND "referrer" IS NOT NULL
    GROUP BY "referrer"
    ORDER BY clicks DESC
    LIMIT 10
  `;
}
