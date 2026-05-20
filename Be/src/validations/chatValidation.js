import { z } from 'zod';

export const chatSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1, 'Vui lòng gửi tin nhắn').max(500, 'Tin nhắn quá dài'),
    conversationId: z.string().trim().max(120, 'conversationId không hợp lệ').optional(),
    currentPath: z.string().trim().max(200, 'currentPath không hợp lệ').optional(),
  }),
});
