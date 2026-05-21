import asyncHandler from 'express-async-handler';
import { generateChatReply } from '../services/chatService.js';

export const handleChat = asyncHandler(async (req, res) => {
  const { message, conversationId, currentPath } = req.body;
  const result = await generateChatReply({ message, conversationId, currentPath, io: req.io });

  res.status(200).json({
    success: true,
    ...result,
  });
});
