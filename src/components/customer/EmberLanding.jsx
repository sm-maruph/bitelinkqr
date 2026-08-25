import { ArrowRight, Flame, MapPin, Timer, UtensilsCrossed } from 'lucide-react'
import CategoryTabs from './CategoryTabs'
import FoodCard from './FoodCard'
import OfferSection from './OfferSection'

export default function EmberLanding({ restaurantName, outlet, onMenu, menuItems, onSelect, onAdd, categories, category, onCategoryChange }) {
  const hero = menuItems[2] || menuItems[0]
  return <div className="ember-site"><OfferSection onMenu={onMenu} variant="ember" />
    <nav className="ember-nav"><a href="#ember-home"><Flame size={18} />EMBER</a><span>Fire · smoke · soul</span><button onClick={onMenu}>View menu</button></nav>
    <section className="ember-hero" id="ember-home"><div className="ember-image"><img src={hero?.image} alt={hero?.name || 'Fire cooked signature dish'} /><span><Flame size={14} /> Cooked over flame</span></div><div className="ember-copy"><small>{restaurantName} · {outlet}</small><h1>Gather<br />around<br /><em>the fire.</em></h1><p>Smoke-led cooking, generous plates and ingredients transformed by flame.</p><button onClick={onMenu}>Taste the menu <ArrowRight size={14} /></button></div></section>
    <section className="ember-strip"><span><Flame /> Live fire kitchen</span><span><Timer /> Slow cooked daily</span><span><MapPin /> {outlet}, Dhaka</span></section>
    <section className="ember-menu" id="ember-menu"><header><div><small>From the hearth</small><h2>Fire-led favourites</h2></div><UtensilsCrossed size={34} /></header><CategoryTabs categories={categories} activeCategory={category} onChange={onCategoryChange} /><div className="ember-grid">{menuItems.slice(0, 8).map((item, index) => <div className={`ember-card ember-card-${index + 1}`} key={item.id}><FoodCard item={item} onSelect={onSelect} onAdd={onAdd} /></div>)}</div></section>
    <section className="ember-story"><span>01</span><h2>Charred outside.<br />Tender within.</h2><p>Our kitchen works patiently with fire, balancing deep caramelisation with bright seasonal produce.</p></section>
    <footer className="ember-footer"><b>EMBER</b><span>{restaurantName} · {outlet}</span><button onClick={onMenu}>Start an order</button></footer>
  </div>
}
