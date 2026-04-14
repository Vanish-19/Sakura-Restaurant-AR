import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    role: z.string().optional(),
    status: z.string().optional(),
  })
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.string().optional(),
    status: z.string().optional(),
  }).refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required to update'
  })
});
