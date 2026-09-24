import { z } from 'zod';
import { MediaType, PostStatus } from '@prisma/client';

export const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(500),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.string().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
  mediaType: z.nativeEnum(MediaType).default('NONE'),
  mediaUrl: z.string().url().optional().nullable(),
  mediaId: z.string().optional().nullable(),
  status: z.nativeEnum(PostStatus).default('DRAFT'),
});

export const updatePostSchema = createPostSchema.partial();

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  search: z.string().optional(),
  status: z.nativeEnum(PostStatus).optional(),
  category: z.string().optional(),
  sort: z.enum(['title', 'createdAt', 'publishedAt', 'updatedAt']).default('createdAt').optional(),
  order: z.enum(['asc', 'desc']).default('desc').optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
