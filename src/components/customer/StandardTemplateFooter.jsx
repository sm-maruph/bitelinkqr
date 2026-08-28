import { ArrowUpRight, AtSign, Clock3, Leaf, MapPin, Utensils } from 'lucide-react'

export default function StandardTemplateFooter({ template, restaurantName, outlet, onMenu }) {
  if (template === 'garden') return <footer className="garden-template-footer">
    <div><Leaf size={22} /><b>{restaurantName}</b><small>Seasonal plates · thoughtful hospitality</small></div>
    <div><span><MapPin size={14} /> {outlet}, Dhaka</span><span><Clock3 size={14} /> Open daily · 11 AM–11 PM</span></div>
    <button onClick={onMenu}>Pick something fresh <ArrowUpRight size={15} /></button>
  </footer>

  return <footer className="editorial-template-footer">
    <div className="editorial-footer-mark"><Utensils size={20} /><span>BL</span></div>
    <div><small>Visit us</small><b>{restaurantName}</b><span>{outlet}, Dhaka</span></div>
    <div><small>Reservations</small><b>+880 1700 000 000</b><span>hello@bitelink.restaurant</span></div>
    <button onClick={onMenu}>Read the menu <ArrowUpRight size={15} /></button>
    <a href="#customer" aria-label="Social profile"><AtSign size={18} /></a>
  </footer>
}
