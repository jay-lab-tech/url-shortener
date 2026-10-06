import { countClicksByDay, countClicksByDevice, countClicksByReferrer, findUrlForAnalytics } from './analytics.repository.js';

export class AnalyticsNotFoundError extends Error {
  constructor() {
    super('URL tidak ditemukan');
    this.name = 'AnalyticsNotFoundError';
  }
}

export async function getUrlAnalytics(urlId: string) {
  const [url, dailyClicks, deviceClicks, referrerClicks] = await Promise.all([
    findUrlForAnalytics(urlId),
    countClicksByDay(urlId),
    countClicksByDevice(urlId),
    countClicksByReferrer(urlId),
  ]);

  if (!url) throw new AnalyticsNotFoundError();

  return {
    url,
    dailyClicks: dailyClicks.map((row) => ({ day: row.day, clicks: Number(row.clicks) })),
    devices: deviceClicks.map((row) => ({ deviceType: row.value, clicks: Number(row.clicks) })),
    referrers: referrerClicks.map((row) => ({ referrer: row.value, clicks: Number(row.clicks) })),
  };
}
