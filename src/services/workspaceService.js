import { apiRequest, authenticatedHeaders } from './apiClient'

const slugify = (value) => String(value).toLowerCase().trim().replaceAll(/\s+/g, '-')
export const workspaceService = {
  getDemoWorkspace: (restaurantSlug, outlet) => apiRequest(`/api/public/demo/workspaces/${encodeURIComponent(restaurantSlug)}/${encodeURIComponent(slugify(outlet))}`),
  getContext: (session, tenantId) => apiRequest('/api/v1/context', { headers: authenticatedHeaders({ accessToken: session.accessToken, tenantId }) }),
  getWorkspace: (session, tenantId, restaurantId, outletId) => apiRequest(`/api/v1/workspace?restaurantId=${encodeURIComponent(restaurantId)}&outletId=${encodeURIComponent(outletId)}`, { headers: authenticatedHeaders({ accessToken: session.accessToken, tenantId }) }),
  getAnalytics: (session, tenantId, restaurantId) => apiRequest(`/api/v1/restaurant-analytics?restaurantId=${encodeURIComponent(restaurantId)}`, { headers: authenticatedHeaders({ accessToken: session.accessToken, tenantId }) }),
  createTable: (session, tenantId, payload) => apiRequest('/api/v1/tables', { method: 'POST', headers: authenticatedHeaders({ accessToken: session.accessToken, tenantId }), body: JSON.stringify(payload) }),
}
