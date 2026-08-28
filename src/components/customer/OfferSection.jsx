import { ArrowRight, BadgePercent, Clock3 } from 'lucide-react'

export default function OfferSection({ onMenu, variant = 'light', content }) {
  return <section className={`template-offer template-offer-${variant}`} aria-label="Special offer">
    <div className="template-offer-icon"><BadgePercent size={24} /></div>
    <div><small>Limited-time table offer</small><h2>{content?.offerTitle || 'Save 20% on signature dishes'}</h2><p>{content?.offerDescription || 'Order two selected mains and enjoy the offer automatically at checkout.'}</p></div>
    <span><Clock3 size={14} /> Today only</span>
    <button onClick={onMenu}>View offers <ArrowRight size={14} /></button>
  </section>
}
