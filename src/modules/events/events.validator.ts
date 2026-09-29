import { z } from 'zod';
import { EventType, EventStatus } from '@prisma/client';

export const createEventSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title must be at most 255 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    type: z.preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase().trim() : val),
      z.nativeEnum(EventType, {
        errorMap: () => ({
          message: 'Invalid event type. Allowed: TRAINING, WORKSHOP, COMMUNITY_OUTREACH, FUNDRAISING, WEBINAR, CONFERENCE, CEREMONY, OTHER',
        }),
      })
    ),
    status: z
      .preprocess(
        (val) => (typeof val === 'string' ? val.toUpperCase().trim() : val),
        z.nativeEnum(EventStatus)
      )
      .default('UPCOMING'),
    eventDate: z.preprocess(
      (val) => (typeof val === 'string' ? val.trim() : val),
      z
        .string()
        .min(1, 'Event date is required')
        .refine((val) => !isNaN(Date.parse(val)), {
          message: 'Event date must be a valid date format (YYYY-MM-DD)',
        })
    ),
    time: z.string().min(1, 'Time is required'),
    location: z.string().min(3, 'Location must be at least 3 characters'),
    seats: z
      .union([z.string(), z.number()])
      .transform((val) => (val !== undefined && val !== null ? String(val) : undefined))
      .optional()
      .nullable(),
    isFree: z.preprocess((val) => {
      if (typeof val === 'string') return val.toLowerCase() === 'true';
      return val;
    }, z.boolean().default(true)),
    fee: z
      .union([z.string(), z.number()])
      .transform((val) => (val !== undefined && val !== null ? String(val) : undefined))
      .optional()
      .nullable(),
    coverImageUrl: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.isFree === false && (!data.fee || String(data.fee).trim() === '')) {
        return false;
      }
      return true;
    },
    {
      message: 'Fee must not be empty when event is not free',
      path: ['fee'],
    }
  );

export const updateEventSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title must be at most 255 characters').optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').optional(),
    type: z
      .preprocess(
        (val) => (typeof val === 'string' ? val.toUpperCase().trim() : val),
        z.nativeEnum(EventType)
      )
      .optional(),
    status: z
      .preprocess(
        (val) => (typeof val === 'string' ? val.toUpperCase().trim() : val),
        z.nativeEnum(EventStatus)
      )
      .optional(),
    eventDate: z
      .preprocess(
        (val) => (typeof val === 'string' ? val.trim() : val),
        z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Event date must be a valid date format (YYYY-MM-DD)',
          })
      )
      .optional(),
    time: z.string().min(1, 'Time is required').optional(),
    location: z.string().min(3, 'Location must be at least 3 characters').optional(),
    seats: z
      .union([z.string(), z.number()])
      .transform((val) => (val !== undefined && val !== null ? String(val) : undefined))
      .optional()
      .nullable(),
    isFree: z
      .preprocess((val) => {
        if (typeof val === 'string') return val.toLowerCase() === 'true';
        return val;
      }, z.boolean())
      .optional(),
    fee: z
      .union([z.string(), z.number()])
      .transform((val) => (val !== undefined && val !== null ? String(val) : undefined))
      .optional()
      .nullable(),
    coverImageUrl: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.isFree === false && (!data.fee || String(data.fee).trim() === '')) {
        return false;
      }
      return true;
    },
    {
      message: 'Fee must not be empty when event is not free',
      path: ['fee'],
    }
  );

export const updateEventStatusSchema = z.object({
  status: z.preprocess(
    (val) => (typeof val === 'string' ? val.toUpperCase().trim() : val),
    z.nativeEnum(EventStatus, {
      errorMap: () => ({
        message: 'Invalid status. Allowed: UPCOMING, ONGOING, PAST, CANCELLED',
      }),
    })
  ),
});

export const listEventsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  status: z
    .preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase().trim() : val),
      z.string()
    )
    .optional(),
  type: z
    .preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase().trim() : val),
      z.nativeEnum(EventType)
    )
    .optional(),
  search: z.string().optional(),
});

export const rsvpEventSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional().nullable(),
  ticketsCount: z.coerce.number().min(1).default(1).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
export type RsvpEventInput = z.infer<typeof rsvpEventSchema>;
