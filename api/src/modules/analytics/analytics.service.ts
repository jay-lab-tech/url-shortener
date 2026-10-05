import { countClicksByDay, findUrlForAnalytics } from './analytics.repository.js';

export class AnalyticsNotFoundError extends Error {
  constructor() {
    super('URL tidak ditemukan');
    this.name = 'AnalyticsNotFoundError';
  }
}

export async function getUrlAnalytics(urlId: string) {
  const [url, dailyClicks] = await Promise.all([
    findUrlForAnalytics(urlId),
    countClicksByDay(urlId),
  ]);

  if (!url) throw new AnalyticsNotFoundError();

  return {
    url,
    dailyClicks: dailyClicks.map((row) => ({ day: row.day, clicks: Number(row.clicks) })),
  };
}
