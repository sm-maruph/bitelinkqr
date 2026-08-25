import { mockStore } from './mockStore'
export const menuService = { list: () => mockStore.getState().menu, setAvailability: (id, availability) => mockStore.setAvailability(id, availability) }
