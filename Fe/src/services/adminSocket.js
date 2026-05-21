import { io } from 'socket.io-client';
import { API_BASE_URL } from './apiClient.js';

function getSocketBaseUrl() {
  const directBase = import.meta.env.VITE_API_DIRECT_BASE_URL || 'http://127.0.0.1:3000/api/v1';
  const apiBase = API_BASE_URL.startsWith('/') ? directBase : API_BASE_URL;
  return apiBase.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
}

export function connectAdminSocket() {
  const socket = io(getSocketBaseUrl(), {
    transports: ['websocket', 'polling'],
    withCredentials: true,
  });

  socket.on('connect', () => {
    socket.emit('join_admin');
  });

  return socket;
}
