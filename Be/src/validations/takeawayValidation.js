import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createTakeawaySchema = z.object({
  body: z.object({
    customer_name: z.string().min(1, 'Customer name is required'),
    customer_phone: z.string().min(8, 'Phone number must be at least 8 characters'),
    delivery_address: z.string().min(1, 'Delivery address is required'),
    payment_method: z.enum(['online', 'cod']).optional(),
    items: z.array(
      z.object({
        menu_item_id: z.string().regex(objectIdRegex, 'Invalid menu item ID'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
        note: z.string().optional(),
      })
    ).min(1, 'Order must contain at least one item'),
  })
});

export const getTakeawayByPhoneSchema = z.object({
  query: z.object({
    phone: z.string().min(8, 'Phone number is required').optional(),
  })
});

export const getTakeawayByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid order ID')
  })
});
