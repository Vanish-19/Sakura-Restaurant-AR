import { z } from 'zod';

const categoryNameSchema = z.string().trim().min(1, 'Category name is required');

export const createFoodCategorySchema = z.object({
  body: z.object({
    name: categoryNameSchema,
  })
});

export const updateFoodCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID')
  }),
  body: z.object({
    name: categoryNameSchema,
  })
});

export const deleteFoodCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID')
  }),
  body: z.object({
    replacementName: z.string().trim().min(1).optional(),
  }).default({})
});