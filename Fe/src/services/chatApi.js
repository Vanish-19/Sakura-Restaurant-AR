import { apiRequest } from './apiClient.js';

export const sendChatMessage = async ({ message, conversationId, currentPath }) => {
  return await apiRequest('/chat', {
    method: 'POST',
    body: { message, conversationId, currentPath },
  });
};
