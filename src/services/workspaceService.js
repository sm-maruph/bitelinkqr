import { apiRequest, authenticatedHeaders } from './apiClient'

const slugify = (value) => String(value).toLowerCase().trim().replaceAll(/\s+/g, '-')
export const workspaceService = {
  getDemoWorkspace: (restaurantSlug, outlet) => apiRequest(`/api/public/demo/workspaces/${encodeURIComponent(restaurantSlug)}/${encodeURIComponent(slugify(outlet))}`),
  getContext: (session, tenantId) => apiRequest('/api/v1/context', { headers: authenticatedHeaders({ accessToken: session.accessToken, tenantId }) }),
  getWorkspace: (session, tenantId, restaurantId, outletId) => apiRequest(`/api/v1/workspace?restaurantId=${encodeURIComponent(restaurantId)}&outletId=${encodeURIComponent(outletId)}`, { headers: authenticatedHeaders({ accessToken: session.accessToken, tenantId }) }),
  getAnalytics: (session, tenantId, restaurantId) => apiRequest(`/api/v1/restaurant-analytics?restaurantId=${encodeURIComponent(restaurantId)}`, { headers: authenticatedHeaders({ accessToken: session.accessToken, tenantId }) }),
  createTable: (session, tenantId, payload) => apiRequest('/api/v1/tables', { method: 'POST', headers: authenticatedHeaders({ accessToken: session.accessToken, tenantId }), body: JSON.stringify(payload) }),
  updateTable: (session, tenantId, id, payload) => apiRequest(`/api/v1/tables/${id}`, { method: 'PATCH', headers: authenticatedHeaders({ accessToken: session.accessToken, tenantId }), body: JSON.stringify(payload) }),
  deleteTable: (session, tenantId, id) => apiRequest(`/api/v1/tables/${id}`, { method: 'DELETE', headers: authenticatedHeaders({ accessToken: session.accessToken, tenantId }) }),
  updateOrderStatus: (session, tenantId, orderId, status) => apiRequest(`/api/v1/orders/${encodeURIComponent(orderId)}/status`, { method: 'PATCH', headers: authenticatedHeaders({ accessToken: session.accessToken, tenantId }), body: JSON.stringify({ status }) }),
  updatePaymentStatus: (session, tenantId, paymentId, status) => apiRequest(`/api/v1/payments/${encodeURIComponent(paymentId)}/status`, { method: 'PATCH', headers: authenticatedHeaders({ accessToken: session.accessToken, tenantId }), body: JSON.stringify({ status }) }),
  updateOrderEstimate: (session,tenantId,orderId,payload)=>apiRequest(`/api/v1/orders/${encodeURIComponent(orderId)}/estimate`,{method:'PATCH',headers:authenticatedHeaders({accessToken:session.accessToken,tenantId}),body:JSON.stringify(payload)}),
}
