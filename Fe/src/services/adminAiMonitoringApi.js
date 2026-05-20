import { apiRequest } from './apiClient.js';

export async function getAiMonitoringOverview(days = 30) {
  return apiRequest(`/admin/ai-monitoring/overview?days=${encodeURIComponent(days)}`, {
    method: 'GET',
  });
}
