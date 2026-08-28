import { apiRequest } from './apiClient'

const slugify = (value) => String(value).toLowerCase().trim().replaceAll(/\s+/g, '-')
export const workspaceService = {
  getDemoWorkspace: (restaurantSlug, outlet) => apiRequest(`/api/public/demo/workspaces/${encodeURIComponent(restaurantSlug)}/${encodeURIComponent(slugify(outlet))}`),
}
