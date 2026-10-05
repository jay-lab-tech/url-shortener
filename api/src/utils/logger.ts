type Meta = Record<string, unknown>;

function write(level: 'info' | 'error', message: string, meta: Meta = {}) {
  const entry = JSON.stringify({ timestamp: new Date().toISOString(), level, service: 'url-shortener-api', message, ...meta });
  if (level === 'error') console.error(entry); else console.log(entry);
}

export const logger = {
  info: (message: string, meta?: Meta) => write('info', message, meta),
  error: (message: string, meta?: Meta) => write('error', message, meta),
};
