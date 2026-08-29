import { apiRequest } from './apiClient'

export const restaurantService = {
  getPublicSite: (restaurantSlug, outletSlug) => apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}`),
  getOrders: (restaurantSlug, outletSlug, tableNumber) => apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}/tables/${encodeURIComponent(tableNumber)}/orders`),
  getLatestOrder: (restaurantSlug, outletSlug, tableNumber) => apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}/tables/${encodeURIComponent(tableNumber)}/orders/latest`),
  placeOrder: (restaurantSlug, outletSlug, tableNumber, payload) => apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}/tables/${encodeURIComponent(tableNumber)}/orders`, { method: 'POST', body: JSON.stringify(payload) }),
}
