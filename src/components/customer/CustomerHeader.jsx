import { Bell, QrCode, ShoppingBag, Store, Utensils } from 'lucide-react'

export default function CustomerHeader({ cartCount, setRole, onCart, tableNumber='12', outlet='Dhanmondi', showAdmin=false }) {
  return <header className="customer-top"><a className="brand" href="#customer"><span className="brand-mark"><Utensils size={17} /></span><span>Bite<span>Link</span></span></a><div className="table-badge"><QrCode size={15} /> Table {tableNumber} <span>•</span> {outlet}</div><div className="customer-actions">{showAdmin&&<button className="portal-back" onClick={() => setRole('owner')}><Store size={15} /> Admin</button>}<button className="customer-icon-action" onClick={() => onCart()} aria-label="Open your order"><ShoppingBag size={19} />{cartCount > 0 && <strong>{cartCount}</strong>}</button><button className="customer-icon-action" aria-label="Customer notifications"><Bell size={18} /></button></div></header>
}
