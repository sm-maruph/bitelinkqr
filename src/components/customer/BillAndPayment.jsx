import React from 'react'
import { Banknote, CheckCircle2, CreditCard, QrCode } from 'lucide-react'

export default function BillAndPayment({ order, payment, onPay, tableNumber='12' }) {
  const fallbackItems = [{id:'demo-kacchi',name:'Special Mutton Kacchi',price:350,quantity:2},{id:'demo-borhani',name:'Borhani',price:60,quantity:2}]
  const items = Array.isArray(order?.itemDetails) && order.itemDetails.length ? order.itemDetails : fallbackItems
  const subtotal = items.reduce((sum,item)=>sum+(Number(item.price)||0)*(Number(item.quantity)||0),0)
  const discount = Number(order?.discount)||0
  const total = Math.max(0,subtotal-discount)
  const [method,setMethod] = React.useState('BANGLA_QR')
  const [reference,setReference] = React.useState('')
  const submit = () => onPay({orderId:order?.id||'#1042',amount:total,method,reference})
  return <section className="customer-panel bill-panel"><div className="customer-panel-heading"><div><span className="section-kicker">Table {tableNumber}</span><h2>Your bill</h2></div><span className={`status ${payment?.status==='VERIFIED'?'green':'amber'}`}>{payment?.status||'PENDING'}</span></div><div className="bill-items" role="table" aria-label="Bill items"><div className="bill-item bill-item-head" role="row"><span>Item</span><span>Qty × price</span><span>Amount</span></div>{items.map(item=>{const quantity=Number(item.quantity)||0,price=Number(item.price)||0;return <div className="bill-item" role="row" key={item.id||item.name}><strong>{item.name}</strong><span>{quantity} × BDT {price}</span><b>BDT {quantity*price}</b></div>})}</div><div className="bill-totals"><span>Subtotal <b>BDT {subtotal}</b></span>{discount>0&&<span>Discount <b>−BDT {discount}</b></span>}<strong>Grand total <b>BDT {total}</b></strong></div><div className="payment-choice"><button className={method==='BANGLA_QR'?'active':''} onClick={()=>setMethod('BANGLA_QR')}><QrCode size={17}/> Bangla QR</button><button className={method==='CASH'?'active':''} onClick={()=>setMethod('CASH')}><Banknote size={17}/> Cash</button></div>{method==='BANGLA_QR'?<div className="mock-qr"><QrCode size={62}/><span>MOCK BANGLA QR</span><label>Reference number<input value={reference} onChange={event=>setReference(event.target.value)} placeholder="BG12345678"/></label><button className="detail-add-button" onClick={submit}>I've paid <CreditCard size={15}/></button></div>:<div className="cash-note">Please pay your bill at the restaurant counter or waiter.<button className="detail-add-button" onClick={submit}>Request cash confirmation</button></div>}{payment?.status==='VERIFIED'&&<p className="payment-success"><CheckCircle2 size={16}/> Payment verified</p>}</section>
}
