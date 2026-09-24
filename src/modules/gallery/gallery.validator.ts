import { z } from 'zod';
import { GalleryCategory, MediaType } from '@prisma/client';

export const createGalleryItemSchema = z.object({
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.nativeEnum(GalleryCategory),
  mediaType: z.nativeEnum(MediaType).default('IMAGE'),
  url: z.string().url(),
  isFeatured: z.boolean().default(false).optional(),
});

export const updateGalleryItemSchema = createGalleryItemSchema.partial();

export const listGalleryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  category: z.nativeEnum(GalleryCategory).optional(),
  mediaType: z.nativeEnum(MediaType).optional(),
});

export type CreateGalleryItemInput = z.infer<typeof createGalleryItemSchema>;
export type UpdateGalleryItemInput = z.infer<typeof updateGalleryItemSchema>;
export type ListGalleryQuery = z.infer<typeof listGalleryQuerySchema>;
