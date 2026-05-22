import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const cancelUserOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid order ID'),
  }),
  body: z.object({
    cancel_reason: z.string().trim().min(3, 'Lý do hủy phải có ít nhất 3 ký tự').max(500, 'Lý do hủy tối đa 500 ký tự'),
  }),
});
