import { apiRequest } from './apiClient.js';

export async function submitCareerApplication(payload) {
  return apiRequest('/careers/applications', {
    method: 'POST',
    body: payload,
  });
}
