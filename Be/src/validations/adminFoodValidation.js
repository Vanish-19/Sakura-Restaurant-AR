import { z } from 'zod';

export const createFoodSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be greater than or equal to 0'),
    category: z.string().min(1, 'Category is required'),
    image_url: z.string().optional(),
    ar_models: z.object({
      glb_url: z.string().optional(),
      usdz_url: z.string().optional(),
    }).optional(),
    is_best_seller: z.boolean().optional(),
    is_available: z.boolean().optional(),
  })
});

export const updateFoodSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid food ID')
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    category: z.string().min(1).optional(),
    image_url: z.string().optional(),
    ar_models: z.object({
      glb_url: z.string().optional(),
      usdz_url: z.string().optional(),
    }).optional(),
    is_best_seller: z.boolean().optional(),
    is_available: z.boolean().optional(),
  }).refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required to update'
  })
});
