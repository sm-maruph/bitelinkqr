import { Clock3, Grid2X2, List, Package, X } from 'lucide-react'

const label = value => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase())

export default function CustomerOrderHistory({ orders, view, onView, onSelect, onClose, loading }) {
  return <div className="customer-modal-backdrop" onClick={onClose}>
    <section className="order-history-modal" onClick={event => event.stopPropagation()}>
      <header><div><span className="section-kicker">TABLE ORDER HISTORY</span><h2>Your orders</h2><p>Track current orders or review anything previously placed from this table.</p></div><button onClick={onClose} aria-label="Close order history"><X size={19}/></button></header>
      <div className="order-history-toolbar"><span>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span><div><button className={view==='grid'?'active':''} onClick={()=>onView('grid')} aria-label="Grid view"><Grid2X2 size={17}/></button><button className={view==='list'?'active':''} onClick={()=>onView('list')} aria-label="List view"><List size={18}/></button></div></div>
      {loading && !orders.length ? <div className="order-history-empty"><Clock3 size={25}/><p>Loading your orders…</p></div> : !orders.length ? <div className="order-history-empty"><Package size={27}/><h3>No orders yet</h3><p>Add dishes to your cart, review them, then place your first order.</p></div> : <div className={`order-history-${view}`}>{orders.map(order=><button className="order-history-card" onClick={()=>onSelect(order)} key={order.id}><div><span>ORDER #{order.orderNumber}</span><b className={`order-state ${order.status.toLowerCase()}`}>{label(order.status)}</b></div><h3>{order.itemDetails.map(item=>`${item.name} × ${item.quantity}`).join(', ')}</h3><footer><span><Clock3 size={13}/>{order.placed}</span><strong>BDT {order.total.toLocaleString()}</strong></footer></button>)}</div>}
    </section>
  </div>
}
