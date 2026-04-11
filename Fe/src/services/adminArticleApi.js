import { apiRequest } from './apiClient.js';

export async function getAllArticles(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/admin/articles?${query}`, { method: 'GET' });
}

export async function getArticleStats() {
  return apiRequest(`/admin/articles/stats`, { method: 'GET' });
}

export async function getArticleById(id) {
  return apiRequest(`/admin/articles/${id}`, { method: 'GET' });
}

export async function createArticle(payload) {
  return apiRequest(`/admin/articles`, { method: 'POST', body: payload });
}

export async function updateArticle(id, payload) {
  return apiRequest(`/admin/articles/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteArticle(id) {
  return apiRequest(`/admin/articles/${id}`, { method: 'DELETE' });
}
