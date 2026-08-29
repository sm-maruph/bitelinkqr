import { apiRequest,authenticatedHeaders } from './apiClient'
const headers=(session,tenantId)=>authenticatedHeaders({accessToken:session.accessToken,tenantId})
export const managementService={
  usage:(session,tenantId)=>apiRequest('/api/v1/subscription-usage',{headers:headers(session,tenantId)}),
  requestOutlet:(session,tenantId,payload)=>apiRequest('/api/v1/outlets',{method:'POST',headers:headers(session,tenantId),body:JSON.stringify(payload)}),
  uploadRestaurantLogo:(session,tenantId,restaurantId,outletId,file)=>{const body=new FormData();body.append('file',file);return apiRequest(`/api/v1/restaurants/${restaurantId}/assets?outletId=${encodeURIComponent(outletId||'')}`,{method:'POST',headers:headers(session,tenantId),body})},
  updateRestaurantLogo:(session,tenantId,restaurantId,payload)=>apiRequest(`/api/v1/restaurants/${restaurantId}/logo`,{method:'PATCH',headers:headers(session,tenantId),body:JSON.stringify(payload)}),
  categories:(session,tenantId,restaurantId)=>apiRequest(`/api/v1/menu-categories?restaurantId=${restaurantId}`,{headers:headers(session,tenantId)}),
  createCategory:(session,tenantId,payload)=>apiRequest('/api/v1/menu-categories',{method:'POST',headers:headers(session,tenantId),body:JSON.stringify(payload)}),
  createItem:(session,tenantId,payload)=>apiRequest('/api/v1/menu-items',{method:'POST',headers:headers(session,tenantId),body:JSON.stringify(payload)}),
  createOffer:(session,tenantId,payload)=>apiRequest('/api/v1/offers',{method:'POST',headers:headers(session,tenantId),body:JSON.stringify(payload)}),
  updateOffer:(session,tenantId,offerId,payload)=>apiRequest(`/api/v1/offers/${offerId}`,{method:'PATCH',headers:headers(session,tenantId),body:JSON.stringify(payload)}),
  setAvailability:(session,tenantId,itemId,payload)=>apiRequest(`/api/v1/menu-items/${itemId}/availability`,{method:'PATCH',headers:headers(session,tenantId),body:JSON.stringify(payload)}),
  updateItem:(session,tenantId,itemId,payload)=>apiRequest(`/api/v1/menu-items/${itemId}`,{method:'PATCH',headers:headers(session,tenantId),body:JSON.stringify(payload)}),
  deleteItem:(session,tenantId,itemId)=>apiRequest(`/api/v1/menu-items/${itemId}`,{method:'DELETE',headers:headers(session,tenantId)}),
}
