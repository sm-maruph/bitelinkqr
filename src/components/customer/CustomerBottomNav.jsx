import { FileText, Home, ShoppingBag, Utensils, Volume2 } from 'lucide-react'

export default function CustomerBottomNav({ cartCount, onMenu, onOrder, onBill, onHelp }) {
  return <nav className="customer-bottom-nav" aria-label="Customer shortcuts"><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Home size={17} /><span>Home</span></button><button className="active" onClick={onMenu}><Utensils size={17} /><span>Menu</span></button><button onClick={onOrder}><ShoppingBag size={17} /><span>Order{cartCount > 0 && <b>{cartCount}</b>}</span></button><button onClick={onBill}><FileText size={17} /><span>Bill</span></button><button onClick={onHelp}><Volume2 size={17} /><span>Help</span></button></nav>
}
