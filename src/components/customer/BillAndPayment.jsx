import React from 'react'
import { Banknote, CheckCircle2, CreditCard, QrCode } from 'lucide-react'

export default function BillAndPayment({ order, payment, onPay }) {
  const total = order?.total || 0
  const [method, setMethod] = React.useState('BANGLA_QR')
  const [reference, setReference] = React.useState('')
  const submit = () => onPay({ orderId: order?.id || '#1042', amount: total, method, reference })
  return <section className="customer-panel bill-panel"><div className="customer-panel-heading"><div><span className="section-kicker">Table 12</span><h2>Your bill</h2></div><span className={`status ${payment?.status === 'VERIFIED' ? 'green' : 'amber'}`}>{payment?.status || 'PENDING'}</span></div><div className="bill-line"><span>{order?.items || 'Special Mutton Kacchi x 2, Borhani x 2'}</span><b>BDT {total || 820}</b></div><div className="bill-totals"><span>Subtotal <b>BDT {order?.subtotal || 870}</b></span><span>Discount <b>-BDT {order?.discount || 50}</b></span><strong>Total <b>BDT {total || 820}</b></strong></div><div className="payment-choice"><button className={method === 'BANGLA_QR' ? 'active' : ''} onClick={() => setMethod('BANGLA_QR')}><QrCode size={17} /> Bangla QR</button><button className={method === 'CASH' ? 'active' : ''} onClick={() => setMethod('CASH')}><Banknote size={17} /> Cash</button></div>{method === 'BANGLA_QR' ? <div className="mock-qr"><QrCode size={62} /><span>MOCK BANGLA QR</span><label>Reference number<input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="BG12345678" /></label><button className="detail-add-button" onClick={submit}>I've paid <CreditCard size={15} /></button></div> : <div className="cash-note">Please pay your bill at the restaurant counter or waiter.<button className="detail-add-button" onClick={submit}>Request cash confirmation</button></div>}{payment?.status === 'VERIFIED' && <p className="payment-success"><CheckCircle2 size={16} /> Payment verified</p>}</section>
}
