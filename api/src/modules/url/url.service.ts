import { generateUniqueShortCode } from '../../utils/shortCode.js';
import { createUrl } from './url.repository.js';
import type { CreateUrlInput } from './url.schemas.js';

export async function createUrlService(userId: string | undefined, input: CreateUrlInput) {
  const shortCode = await generateUniqueShortCode();
  return createUrl({
    ...(userId ? { userId } : {}),
    shortCode,
    ...(input.customAlias ? { customAlias: input.customAlias } : {}),
    originalUrl: input.originalUrl,
    ...(input.title ? { title: input.title } : {}),
    ...(input.expiresAt ? { expiresAt: input.expiresAt } : {}),
  });
}
