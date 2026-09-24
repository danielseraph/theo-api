import { z } from 'zod';

export const listMediaQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  type: z.enum(['IMAGE', 'VIDEO']).optional(),
  sort: z.enum(['createdAt', 'size', 'originalName']).default('createdAt').optional(),
  order: z.enum(['asc', 'desc']).default('desc').optional(),
});

export type ListMediaQuery = z.infer<typeof listMediaQuerySchema>;
