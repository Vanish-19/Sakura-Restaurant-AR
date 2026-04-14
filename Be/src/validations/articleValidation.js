import { z } from 'zod';

export const createArticleSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    category: z.string().optional(),
    author: z.string().optional(),
    image_url: z.string().optional(),
    is_published: z.boolean().optional(),
  })
});

export const updateArticleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid article ID')
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    category: z.string().optional(),
    author: z.string().optional(),
    image_url: z.string().optional(),
    is_published: z.boolean().optional(),
  }).refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required to update'
  })
});
