import { apiRequest } from './apiClient'

const customerSessionKey='bitelink-customer-session'
const customerSession=()=>{let token=sessionStorage.getItem(customerSessionKey);if(!token){token=crypto.randomUUID();sessionStorage.setItem(customerSessionKey,token)}return token}
const customerHeaders=()=>({'x-customer-session':customerSession()})
const tableToken=()=>{
  const url=new URL(window.location.href),token=url.searchParams.get('access')||sessionStorage.getItem('bitelink-table-token')||''
  if(url.searchParams.has('access')){if(token)sessionStorage.setItem('bitelink-table-token',token);url.searchParams.delete('access');window.history.replaceState({},'',`${url.pathname}${url.search}${url.hash}`)}
  return token
}
const secureCustomerHeaders=()=>({...customerHeaders(),'x-table-token':tableToken()})

export const restaurantService = {
  getPublicSite: (restaurantSlug, outletSlug) => {tableToken();return apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}`)},
  getOrders: (restaurantSlug, outletSlug, tableNumber) => apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}/tables/${encodeURIComponent(tableNumber)}/orders`,{headers:secureCustomerHeaders()}),
  getLatestOrder: (restaurantSlug, outletSlug, tableNumber) => apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}/tables/${encodeURIComponent(tableNumber)}/orders/latest`,{headers:secureCustomerHeaders()}),
  getOrderPayment: (restaurantSlug, outletSlug, tableNumber, orderId) => apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}/tables/${encodeURIComponent(tableNumber)}/orders/${encodeURIComponent(orderId)}/payment`,{headers:secureCustomerHeaders()}),
  submitOrderPayment: (restaurantSlug, outletSlug, tableNumber, orderId, payload) => apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}/tables/${encodeURIComponent(tableNumber)}/orders/${encodeURIComponent(orderId)}/payment`,{method:'POST',headers:{...secureCustomerHeaders(),'idempotency-key':crypto.randomUUID()},body:JSON.stringify(payload)}),
  placeOrder: (restaurantSlug, outletSlug, tableNumber, payload) => apiRequest(`/api/public/restaurants/${encodeURIComponent(restaurantSlug)}/outlets/${encodeURIComponent(outletSlug)}/tables/${encodeURIComponent(tableNumber)}/orders`, { method: 'POST', headers:{...secureCustomerHeaders(),'idempotency-key':crypto.randomUUID()}, body: JSON.stringify(payload) }),
  subscribe: (restaurantSlug,outletSlug,tableNumber,onEvent) => {
    let socket,timer,closed=false
    const connect=()=>{if(closed)return;const configured=(import.meta.env.VITE_API_URL||window.location.origin).replace(/\/$/,'');socket=new WebSocket(`${configured.replace(/^http/,'ws')}/api/realtime`);socket.addEventListener('open',()=>socket.send(JSON.stringify({mode:'guest',restaurantSlug,outletSlug,tableNumber,tableToken:tableToken(),customerSession:customerSession()})));socket.addEventListener('message',event=>{try{const message=JSON.parse(event.data);if(message.type!=='ready')onEvent(message)}catch{/* Ignore malformed events. */}});socket.addEventListener('close',()=>{if(!closed)timer=window.setTimeout(connect,3000)})}
    connect();return()=>{closed=true;if(timer)window.clearTimeout(timer);if(socket)socket.close()}
  },
}
