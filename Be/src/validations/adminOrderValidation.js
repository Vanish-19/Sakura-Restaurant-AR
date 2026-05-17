import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const getOrdersSchema = z.object({
  query: z.object({
    status: z.enum(['pending', 'cooking', 'served', 'ready', 'picked_up', 'paid', 'cancelled']).optional(),
    order_type: z.enum(['dine_in', 'takeaway']).optional(),
    order_id: z.string().trim().min(1).max(64).optional(),
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  }).optional()
});

export const getOrderByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid order ID')
  })
});

export const updateAdminOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid order ID')
  }),
  body: z.object({
    status: z.enum(['pending', 'cooking', 'served', 'ready', 'picked_up', 'paid', 'cancelled'])
  })
});

export const updateOrderItemStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid order ID'),
    itemId: z.string().regex(objectIdRegex, 'Invalid order item ID')
  }),
  body: z.object({
    status: z.enum(['pending', 'cooking', 'ready', 'served', 'cancelled'])
  })
});

export const cancelOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid order ID')
  })
});

export const hardDeleteOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid order ID')
  })
});
