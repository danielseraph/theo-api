import { z } from 'zod';
import { ContactStatus } from '@prisma/client';

export const createContactSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(200),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  subject: z.string().min(2).max(500),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export const updateContactStatusSchema = z.object({
  status: z.nativeEnum(ContactStatus),
});

export const listContactMessagesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  status: z.nativeEnum(ContactStatus).optional(),
  search: z.string().optional(),
  sort: z.enum(['createdAt', 'fullName', 'status']).default('createdAt').optional(),
  order: z.enum(['asc', 'desc']).default('desc').optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactStatusInput = z.infer<typeof updateContactStatusSchema>;
export type ListContactMessagesQuery = z.infer<typeof listContactMessagesQuerySchema>;
