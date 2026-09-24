import { z } from 'zod';
import { LeadershipCategory } from '@prisma/client';

export const createLeadershipMemberSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  bio: z.string().optional().nullable(),
  category: z.nativeEnum(LeadershipCategory),
  photoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
  displayOrder: z.number().int().optional(),
});

export const updateLeadershipMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  role: z.string().min(1, 'Role is required').optional(),
  bio: z.string().optional().nullable(),
  category: z.nativeEnum(LeadershipCategory).optional(),
  photoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
  displayOrder: z.number().int().optional(),
});

export const reorderLeadershipSchema = z.array(
  z.object({
    id: z.string().min(1, 'ID is required'),
    displayOrder: z.number().int(),
  })
).min(1, 'Must provide at least one item to reorder');
