import { apiRequest } from './apiClient'

export const analyticsService={
  getRestaurantAnalytics:(restaurantSlug)=>apiRequest(`/api/public/demo/restaurants/${encodeURIComponent(restaurantSlug)}/analytics`),
}
