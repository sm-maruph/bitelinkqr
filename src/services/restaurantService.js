import { restaurants } from '../data/mockData'
export const restaurantService = { list: () => restaurants, getBySlug: (slug) => restaurants.find((restaurant) => restaurant.id === slug || restaurant.name.toLowerCase().replaceAll(' ', '') === slug) }
