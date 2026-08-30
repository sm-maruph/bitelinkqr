import { apiRequest } from './apiClient'

const customerSessionKey='bitelink-customer-session'
const customerSession=()=>{let token=sessionStorage.getItem(customerSessionKey);if(!token){token=crypto.randomUUID();sessionStorage.setItem(customerSessionKey,token)}return token}
const customerHeaders=()=>({'x-customer-session':customerSession()})

export const restaurantService = {
  getPublicSite: (restaurantSlug, outletSlug) => apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}`),
  getOrders: (restaurantSlug, outletSlug, tableNumber) => apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}/tables/${encodeURIComponent(tableNumber)}/orders`,{headers:customerHeaders()}),
  getLatestOrder: (restaurantSlug, outletSlug, tableNumber) => apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}/tables/${encodeURIComponent(tableNumber)}/orders/latest`,{headers:customerHeaders()}),
  getOrderPayment: (restaurantSlug, outletSlug, tableNumber, orderId) => apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}/tables/${encodeURIComponent(tableNumber)}/orders/${encodeURIComponent(orderId)}/payment`,{headers:customerHeaders()}),
  submitOrderPayment: (restaurantSlug, outletSlug, tableNumber, orderId, payload) => apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}/tables/${encodeURIComponent(tableNumber)}/orders/${encodeURIComponent(orderId)}/payment`,{method:'POST',headers:customerHeaders(),body:JSON.stringify(payload)}),
  placeOrder: (restaurantSlug, outletSlug, tableNumber, payload) => apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}/tables/${encodeURIComponent(tableNumber)}/orders`, { method: 'POST', headers:customerHeaders(), body: JSON.stringify(payload) }),
}
