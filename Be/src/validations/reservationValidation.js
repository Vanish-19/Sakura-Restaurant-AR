import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const reservationBodySchema = z.object({
  table: z.string().regex(objectIdRegex, 'Invalid table ID').optional(),
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_phone: z.string().min(8, 'Customer phone is required'),
  customer_email: z.string().email('Invalid email').optional().or(z.literal('')),
  party_size: z.coerce.number().int().min(1, 'Party size must be at least 1'),
  reservation_time: z.coerce.date(),
  expected_duration_minutes: z.coerce.number().int().min(30).optional(),
  source: z.enum(['contact', 'ai', 'admin']).optional(),
  note: z.string().max(1000).optional().or(z.literal('')),
});

export const createReservationSchema = z.object({
  body: reservationBodySchema,
});

export const tableReservationParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid table ID'),
  }),
});
