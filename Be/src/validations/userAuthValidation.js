import { z } from 'zod';

export const registerUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email').optional(),
    phone: z.string().min(8, 'Phone is invalid').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }).refine((data) => Boolean(data.email || data.phone), {
    message: 'Email or phone is required',
    path: ['email'],
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    identity: z.string().min(1, 'Identity is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const phoneTokenSchema = z.object({
  body: z.object({
    phone: z.string().min(8, 'Phone is required'),
    name: z.string().optional(),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10, 'Refresh token is required'),
  }),
});
