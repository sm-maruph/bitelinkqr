import { ArrowRight, Check, Clock3, Package, Sparkles } from 'lucide-react'

const steps = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED']
const labels = ['Received', 'Confirmed', 'Preparing', 'Ready', 'Served']

export default function OrderTracker({ order, onOrderMore }) {
  if (!order) {
    return <section className="customer-panel empty-order"><Package size={22} /><h2>Your table is ready</h2><p>Place an order and the kitchen will keep you posted here.</p></section>
  }

  const currentIndex = Math.max(0, steps.indexOf(order.status))
  const hasItemDetails = order.itemDetails?.length > 0
  const status = order.status.charAt(0) + order.status.slice(1).toLowerCase()

  return (
    <section className="customer-panel tracker-panel">
      <div className="customer-panel-heading">
        <div>
          <span className="section-kicker">Table {order.tableId || '12'} &middot; live order</span>
          <h2>Order {order.id}</h2>
        </div>
        <span className="status green">{status}</span>
      </div>
      <p className="tracker-message"><Sparkles size={15} /> We're preparing your food. Estimated time: <b>15 - 20 min</b></p>
      <div className="order-timeline">
        {steps.map((step, index) => <div className={index <= currentIndex ? 'complete' : ''} key={step}><span>{index < currentIndex ? <Check size={13} /> : index === currentIndex ? <Clock3 size={13} /> : index + 1}</span><small>{labels[index]}</small></div>)}
      </div>
      <div className="tracker-details">
        <span className="section-kicker">Order details</span>
        {hasItemDetails ? (
          <div className="tracker-items">
            {order.itemDetails.map((item) => <div className="tracker-item" key={item.id || item.name}><span><b>{item.name}</b><small>BDT {item.price} &times; {item.quantity}</small></span><strong>BDT {(item.price * item.quantity).toLocaleString()}</strong></div>)}
          </div>
        ) : <p className="tracker-item-summary">{order.items}</p>}
        <div className="tracker-totals">
          {order.subtotal != null && <span>Subtotal <b>BDT {order.subtotal.toLocaleString()}</b></span>}
          {order.discount > 0 && <span>Discount <b>- BDT {order.discount.toLocaleString()}</b></span>}
          <strong>Total <b>{order.total != null ? `BDT ${order.total.toLocaleString()}` : order.amount}</b></strong>
        </div>
      </div>
      <button className="text-button" onClick={onOrderMore}>Order more <ArrowRight size={13} /></button>
    </section>
  )
}
