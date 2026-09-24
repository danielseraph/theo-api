import { z } from 'zod';

export const createRegistrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().min(7).max(20).regex(/^[+\d\s()-]+$/, 'Invalid phone number format'),
  state: z.string().max(100).optional().default(''),
  country: z.string().max(100).optional().default(''),
  areaOfInterest: z.string().max(255).optional().nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}<>]/, 'Password must contain at least one special character')
    .optional()
    .nullable(),
});

export const listRegistrationsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  search: z.string().optional(),
  sort: z.enum(['firstName', 'lastName', 'email', 'createdAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type ListRegistrationsQuery = z.infer<typeof listRegistrationsQuerySchema>;
