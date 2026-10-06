export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown';

export function detectDeviceType(userAgent?: string): DeviceType {
  if (!userAgent) return 'unknown';
  const value = userAgent.toLowerCase();
  if (/bot|crawler|spider|slurp|headless/.test(value)) return 'bot';
  if (/tablet|ipad/.test(value)) return 'tablet';
  if (/mobile|android|iphone|ipod/.test(value)) return 'mobile';
  return 'desktop';
}
