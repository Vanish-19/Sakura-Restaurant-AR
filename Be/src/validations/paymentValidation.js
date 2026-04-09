import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createPaymentSchema = z.object({
  body: z.object({
    order_id: z.string().regex(objectIdRegex, 'Invalid order ID'),
    method: z.enum(['online', 'cod'], { message: 'Method must be online or cod' }),
  })
});

export const getPaymentByOrderSchema = z.object({
  params: z.object({
    orderId: z.string().regex(objectIdRegex, 'Invalid order ID')
  })
});

export const refundPaymentSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid payment ID')
  })
});
