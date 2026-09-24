import { z } from 'zod';
import { EventStatus } from '@prisma/client';

export const createEventSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  date: z.coerce.date(),
  venue: z.string().optional().nullable(),
  virtualLink: z.string().url().optional().nullable(),
  price: z.number().optional().nullable(),
  currency: z.string().default('USD').optional(),
  status: z.nativeEnum(EventStatus).default('UPCOMING'),
});

export const updateEventSchema = createEventSchema.partial();

export const updateEventStatusSchema = z.object({
  status: z.nativeEnum(EventStatus),
});

export const listEventsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  status: z.nativeEnum(EventStatus).optional(),
});

export const rsvpEventSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  ticketsCount: z.number().min(1).default(1).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
export type RsvpEventInput = z.infer<typeof rsvpEventSchema>;
