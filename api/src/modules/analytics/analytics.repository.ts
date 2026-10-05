import { prisma } from '../../config/database.js';

const analyticsUrlSelect = {
  id: true,
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
