const key = 'bitelink-api-cache-v2'
const initialState = {
  menu: [],
  orders: [
    { id:'#1049',restaurantId:'terrace',outletId:'Dhanmondi',tableId:'03',status:'SERVED',placed:'42 min ago',itemDetails:[{id:'rib',name:'Smoked Beef Rib',price:690,quantity:1},{id:'prawn',name:'Crispy Prawn Toast',price:360,quantity:1}],items:'Smoked Beef Rib x 1, Crispy Prawn Toast x 1',subtotal:1050,discount:50,total:1000 },
    { id:'#1050',restaurantId:'terrace',outletId:'Dhanmondi',tableId:'08',status:'READY',placed:'27 min ago',itemDetails:[{id:'tandoori',name:'Tandoori Chicken',price:420,quantity:2},{id:'aubergine',name:'Charred Aubergine',price:280,quantity:1}],items:'Tandoori Chicken x 2, Charred Aubergine x 1',subtotal:1120,discount:50,total:1070 },
    { id:'#1051',restaurantId:'terrace',outletId:'Gulshan',tableId:'05',status:'CONFIRMED',placed:'18 min ago',itemDetails:[{id:'prawn',name:'Crispy Prawn Toast',price:360,quantity:2},{id:'tandoori',name:'Tandoori Chicken',price:420,quantity:1}],items:'Crispy Prawn Toast x 2, Tandoori Chicken x 1',subtotal:1140,discount:50,total:1090 },
    { id:'#1052',restaurantId:'kacchi',outletId:'Dhanmondi',tableId:'04',status:'PREPARING',placed:'14 min ago',itemDetails:[{id:'mutton',name:'Special Mutton Kacchi',price:350,quantity:3},{id:'borhani',name:'Borhani',price:60,quantity:3}],items:'Special Mutton Kacchi x 3, Borhani x 3',subtotal:1230,discount:50,total:1180 },
    { id:'#1053',restaurantId:'noodle',outletId:'Banani',tableId:'02',status:'PENDING',placed:'8 min ago',itemDetails:[{id:'noodles',name:'Chilli Garlic Noodles',price:290,quantity:2},{id:'ramen',name:'Chicken Ramen',price:420,quantity:1}],items:'Chilli Garlic Noodles x 2, Chicken Ramen x 1',subtotal:1000,discount:50,total:950 },
    { id:'#1054',restaurantId:'terrace',outletId:'Dhanmondi',tableId:'07',status:'CONFIRMED',placed:'6 min ago',itemDetails:[{id:'rib',name:'Smoked Beef Rib',price:690,quantity:1},{id:'aubergine',name:'Charred Aubergine',price:280,quantity:2}],items:'Smoked Beef Rib x 1, Charred Aubergine x 2',subtotal:1250,discount:50,total:1200 },
    { id:'#1055',restaurantId:'terrace',outletId:'Dhanmondi',tableId:'12',status:'PREPARING',placed:'Just now',itemDetails:[{id:'mutton',name:'Special Mutton Kacchi',price:350,quantity:2},{id:'borhani',name:'Borhani',price:60,quantity:2},{id:'prawn',name:'Crispy Prawn Toast',price:360,quantity:1}],items:'Special Mutton Kacchi x 2, Borhani x 2, Crispy Prawn Toast x 1',subtotal:1180,discount:50,total:1130 },
  ],
  payments: [
    {id:'pay-1049',orderId:'#1049',amount:1000,method:'BANGLA_QR',reference:'BG84920176',status:'VERIFIED'},
    {id:'pay-1050',orderId:'#1050',amount:1070,method:'CASH',reference:'',status:'VERIFIED'},
    {id:'pay-1051',orderId:'#1051',amount:1090,method:'BANGLA_QR',reference:'BG57219403',status:'SUBMITTED'},
  ],
  requests: [
    {id:'req-1',table:'03',type:'WATER',status:'RESOLVED'},
    {id:'req-2',table:'08',type:'WAITER',status:'OPEN'},
    {id:'req-3',table:'12',type:'CUTLERY',status:'OPEN'},
    {id:'req-4',table:'05',type:'CLEAN_TABLE',status:'OPEN'},
  ],
}

const read = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(key))
    if (!saved) return initialState
    return {
      ...initialState,
      ...saved,
      menu: [],
      orders: saved.orders?.length ? saved.orders : initialState.orders,
      payments: saved.payments?.length ? saved.payments : initialState.payments,
      requests: saved.requests?.length ? saved.requests : initialState.requests,
    }
  } catch { return initialState }
}
let state = read()
const persist = () => localStorage.setItem(key, JSON.stringify(state))

export const mockStore = {
  getState: () => state,
  subscribe: (listener) => { window.addEventListener('bitelink:store', listener); return () => window.removeEventListener('bitelink:store', listener) },
  update: (patch) => { state = { ...state, ...patch }; persist(); window.dispatchEvent(new Event('bitelink:store')); return state },
  hydratePublicMenu: (items) => mockStore.update({
    menu: items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category_name,
      price: Number(item.price),
      tag: item.tags?.[0] || (item.is_featured ? 'Featured' : ''),
      image: item.image_url,
      description: item.description,
      availability: String(item.availability).toUpperCase(),
      preparationTime: item.preparation_minutes,
      orderCount: Number(item.order_count || 0),
      quantityOrdered: Number(item.quantity_ordered || 0),
      popularNow: Boolean(item.popular_now),
      onOffer: Boolean(item.on_offer),
      offers: item.offers || [],
    })),
  }),
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
