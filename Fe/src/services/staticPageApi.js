import { apiRequest } from './apiClient.js';

export async function getPublicStaticPage(slug) {
  return apiRequest(`/static-pages/public/${slug}`, { method: 'GET' });
}

export async function getAdminStaticPages() {
  return apiRequest('/static-pages/admin', { method: 'GET' });
}

export async function updateAdminStaticPage(slug, payload) {
  return apiRequest(`/static-pages/admin/${slug}`, {
    method: 'PATCH',
    body: payload,
  });
}
