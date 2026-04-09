import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createTableSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Table name is required'),
    qr_hash: z.string().min(1, 'QR hash is required'),
  })
});

export const updateTableSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid table ID')
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    status: z.enum(['empty', 'dining']).optional(),
  })
});

export const tableIdSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid table ID')
  })
});
