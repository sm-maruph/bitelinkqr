import { apiRequest } from './apiClient'

export const restaurantService = {
  getPublicSite: (restaurantSlug, outletSlug) => apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}`),
}
