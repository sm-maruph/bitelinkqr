import { apiRequest } from './apiClient'

export const platformService = {
  getDemoOverview: () => apiRequest('/api/public/demo/platform-overview'),
}
