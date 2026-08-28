import { apiRequest,authenticatedHeaders } from './apiClient'
const headers=(session,tenantId)=>authenticatedHeaders({accessToken:session.accessToken,tenantId})
export const managementService={
  usage:(session,tenantId)=>apiRequest('/api/v1/subscription-usage',{headers:headers(session,tenantId)}),
  requestOutlet:(session,tenantId,payload)=>apiRequest('/api/v1/outlets',{method:'POST',headers:headers(session,tenantId),body:JSON.stringify(payload)}),
  categories:(session,tenantId,restaurantId)=>apiRequest(`/api/v1/menu-categories?restaurantId=${restaurantId}`,{headers:headers(session,tenantId)}),
  createCategory:(session,tenantId,payload)=>apiRequest('/api/v1/menu-categories',{method:'POST',headers:headers(session,tenantId),body:JSON.stringify(payload)}),
  createItem:(session,tenantId,payload)=>apiRequest('/api/v1/menu-items',{method:'POST',headers:headers(session,tenantId),body:JSON.stringify(payload)}),
}
