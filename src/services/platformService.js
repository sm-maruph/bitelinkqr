import { apiRequest } from './apiClient'

export const platformService = {
  getDemoOverview: () => apiRequest('/api/public/demo/platform-overview'),
  getOutletRequests: token => apiRequest('/api/platform/outlet-requests',{headers:{authorization:`Bearer ${token}`}}),
  decideOutlet: (token,id,decision) => apiRequest(`/api/platform/outlet-requests/${id}/${decision}`,{method:'PATCH',headers:{authorization:`Bearer ${token}`}}),
}
