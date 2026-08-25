import { Check, GlassWater, Hand, ReceiptText, Utensils } from 'lucide-react'

const requestTypes = [['CALL_WAITER', 'Call waiter', Hand], ['REQUEST_BILL', 'Request bill', ReceiptText], ['REQUEST_WATER', 'Request water', GlassWater], ['ASSISTANCE', 'Assistance', Utensils]]
export default function CustomerRequests({ requests, onRequest, onResolve }) {
  return <section className="customer-panel request-panel" id="requests"><div className="customer-panel-heading"><div><span className="section-kicker">At your service</span><h2>Need anything?</h2></div></div><div className="request-grid">{requestTypes.map(([type, label, Icon]) => <button key={type} onClick={() => onRequest(type)}><Icon size={17} /> {label}</button>)}</div>{requests.filter((request) => request.status === 'OPEN').map((request) => <div className="request-alert" key={request.id}><span><BellIcon /><b>{request.type.replaceAll('_', ' ')}</b> sent to the team</span><button onClick={() => onResolve(request.id)}><Check size={14} /> Done</button></div>)}</section>
}
function BellIcon() { return <span aria-hidden="true">•</span> }
