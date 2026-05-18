import { apiRequest } from './apiClient.js';

export async function getPublishedArticles(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/articles?${query}`, { method: 'GET' });
}

export async function getArticleById(id) {
  return apiRequest(`/articles/${id}`, { method: 'GET' });
}
