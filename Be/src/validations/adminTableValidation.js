import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createTableSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Table name is required'),
    qr_hash: z.string().min(1, 'QR hash is required'),
    zone: z.string().optional(),
    capacity: z.coerce.number().int().min(1).optional(),
  })
});

export const updateTableSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid table ID')
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    qr_hash: z.string().min(1).optional(),
    zone: z.string().optional(),
    capacity: z.coerce.number().int().min(1).optional(),
    status: z.enum(['empty', 'dining', 'reserved']).optional(),
  })
});

export const tableIdSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid table ID')
  })
});

export const updateReservationStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid table ID'),
    reservationId: z.string().regex(objectIdRegex, 'Invalid reservation ID'),
  }),
  body: z.object({
    status: z.enum(['seated', 'completed', 'cancelled', 'no_show']),
  }),
});
