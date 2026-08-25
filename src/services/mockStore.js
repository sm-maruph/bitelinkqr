import { menuItems as seedMenu, orderRows as seedOrders } from '../data/mockData'

const key = 'bitelink-demo-store'
const initialState = {
  menu: seedMenu.map((item, index) => ({ ...item, id: `menu-${index + 1}`, restaurantId: 'terrace', availability: 'AVAILABLE', preparationTime: 20 })),
  orders: seedOrders.map(([id, table, items, amount, status, placed]) => ({ id, tableId: table, items, amount, status: status.toUpperCase(), placed })),
  payments: [{ id: 'pay-1048', orderId: '#1048', amount: 1540, method: 'BANGLA_QR', status: 'SUBMITTED', reference: 'BG12345678' }],
  requests: [{ id: 'req-1', table: '12', type: 'CALL_WAITER', status: 'OPEN' }],
}

const read = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(key))
    if (!saved) return initialState
    const savedByName = new Map((saved.menu || []).map((item) => [item.name, item]))
    const menu = initialState.menu.map((item) => ({ ...item, ...savedByName.get(item.name) }))
    return { ...initialState, ...saved, menu }
  } catch { return initialState }
}
let state = read()
const persist = () => localStorage.setItem(key, JSON.stringify(state))

export const mockStore = {
  getState: () => state,
  subscribe: (listener) => { window.addEventListener('bitelink:store', listener); return () => window.removeEventListener('bitelink:store', listener) },
  update: (patch) => { state = { ...state, ...patch }; persist(); window.dispatchEvent(new Event('bitelink:store')); return state },
  placeOrder: (order) => {
    const nextOrderNumber = Math.max(1048, ...state.orders.map(({ id }) => Number(String(id).replace(/\D/g, '')) || 0)) + 1
    const created = { ...order, id: `#${nextOrderNumber}`, status: 'PENDING', placed: 'Just now' }
    mockStore.update({ orders: [...state.orders, created] })
    return created
  },
  updateOrderStatus: (id, status) => mockStore.update({ orders: state.orders.map((order) => order.id === id ? { ...order, status } : order) }),
  setAvailability: (id, availability) => mockStore.update({ menu: state.menu.map((item) => item.id === id ? { ...item, availability } : item) }),
  submitPayment: (payment) => mockStore.update({ payments: [...state.payments, { ...payment, id: `pay-${Date.now()}`, status: 'SUBMITTED' }] }),
  verifyPayment: (id, status = 'VERIFIED') => mockStore.update({ payments: state.payments.map((payment) => payment.id === id ? { ...payment, status } : payment) }),
  addRequest: (request) => mockStore.update({ requests: [...state.requests, { ...request, id: `req-${Date.now()}`, status: 'OPEN' }] }),
  resolveRequest: (id) => mockStore.update({ requests: state.requests.map((request) => request.id === id ? { ...request, status: 'RESOLVED' } : request) }),
}
