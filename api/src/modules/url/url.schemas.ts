import { z } from 'zod';

const optionalDate = z.preprocess(
  (value) => value === undefined || value === null || value === '' ? undefined : value,
  z.coerce.date().refine((value) => value.getTime() > Date.now(), 'Tanggal kedaluwarsa harus di masa depan').optional(),
);

export const createUrlSchema = z.strictObject({
  originalUrl: z.string().url().refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), 'URL hanya boleh menggunakan HTTP atau HTTPS'),
  customAlias: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Alias hanya boleh berisi huruf, angka, underscore, dan hyphen').optional(),
  title: z.string().trim().max(200).optional(),
  expiresAt: optionalDate,
});

export type CreateUrlInput = z.infer<typeof createUrlSchema>;

export const updateUrlSchema = z.strictObject({
  originalUrl: z.string().url().refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), 'URL hanya boleh menggunakan HTTP atau HTTPS').optional(),
  title: z.string().trim().max(200).nullable().optional(),
  expiresAt: z.union([
    z.coerce.date().refine((value) => value.getTime() > Date.now(), 'Tanggal kedaluwarsa harus di masa depan'),
    z.null(),
  ]).optional(),
  isActive: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, 'Minimal satu field harus diisi');

export type UpdateUrlInput = z.infer<typeof updateUrlSchema>;
