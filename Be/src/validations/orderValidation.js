import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    customer_phone: z.string().min(8, 'Phone number is invalid').optional(),
    items: z.array(
      z.object({
        menu_item_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid menu item ID (MongoDB ObjectId error)'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
        note: z.string().optional(),
      })
    ).min(1, 'Order must contain at least one item')
  })
});

export const updateOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID')
  }),
  body: z.object({
    status: z.enum(['pending', 'cooking', 'served', 'paid'])
  })
});
