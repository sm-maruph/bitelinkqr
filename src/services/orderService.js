import { mockStore } from './mockStore'
export const orderService = { list: () => mockStore.getState().orders, place: (order) => mockStore.placeOrder(order), updateStatus: (id, status) => mockStore.updateOrderStatus(id, status) }
