import { useState } from 'react'
import { ArrowRight, Atom, Bot, ChevronRight, Clock3, Cpu, Orbit, Radio, ShoppingBag, Sparkles, Star, Zap } from 'lucide-react'
import CategoryTabs from './CategoryTabs'
import FoodCard from './FoodCard'
import OfferSection from './OfferSection'
import MenuPagination from './MenuPagination'
import { futuristicTemplateMap } from '../../data/templateCatalog'

/* Template definitions live in templateCatalog so previews and live pages share one source. */
const legacyConfigs = {
  'future-neon': ['Neon Nova', '#00f5ff', '#ff3df2', 1, 'Taste beyond tomorrow'],
  'future-hologram': ['Hologram Feast', '#70ffca', '#8a7dff', 2, 'A feast made of light'],
  'future-paper': ['Paper & Salt', '#d94b32', '#e7b44d', 3, 'A fresh page for flavour'],
  'future-cyber': ['Cyber Bento', '#ff426d', '#19d9ff', 4, 'Street food, upgraded'],
  'future-aurora': ['Aurora Kitchen', '#80ffdb', '#b388ff', 5, 'Cooked under new skies'],
  'future-quantum': ['Quantum Plate', '#c6ff00', '#00b8d4', 6, 'Infinite taste states'],
  'future-solar': ['Solar Flare', '#ffb000', '#ff3d00', 7, 'Powered by fire'],
  'future-lunar': ['Lunar Lounge', '#d8e2ff', '#7c4dff', 8, 'Dinner after dark'],
  'future-bio': ['Bio Lumina', '#64ff72', '#00e5ff', 9, 'Naturally electric'],
  'future-chrome': ['Chrome Café', '#315f73', '#9eb6c2', 10, 'Polished to perfection'],
  'future-void': ['Void Supper', '#ff4d8d', '#8f5cff', 11, 'Into the delicious unknown'],
  'future-prism': ['Prism Pantry', '#ff6ec7', '#62e7ff', 12, 'Every flavour, refracted'],
  'future-synth': ['Synthwave Diner', '#ff2bd6', '#ff8a00', 13, 'Retro taste, future pulse'],
  'future-crystal': ['Crystal Table', '#167b78', '#9bc9c3', 14, 'Clarity in every course'],
  'future-plasma': ['Plasma Grill', '#ff5a36', '#ffe600', 15, 'High-energy dining'],
  'future-zen': ['Neo Zen', '#3f7452', '#a9c5a4', 16, 'Stillness meets flavour'],
  'future-circuit': ['Circuit Kitchen', '#34ff9a', '#ffd23f', 17, 'Connected by taste'],
  'future-cosmos': ['Cosmos Eatery', '#9a7dff', '#ff75bc', 18, 'A universe on your plate'],
  'future-flux': ['Flux Bistro', '#00ffc6', '#ff477e', 19, 'Always fresh. Never static.'],
  'future-oasis': ['Digital Oasis', '#46f7d5', '#f5cb5c', 20, 'Recharge your senses'],
}

export default function FuturisticLanding({ template, restaurantName, logoUrl, outlet, content, onMenu, onCart, cartCount, menuItems, currentPage, pageCount, onPageChange, onSelect, onAdd, categories, category, onCategoryChange }) {
  const selected=futuristicTemplateMap[template]
  const {name,primary,secondary,layout,headline}=selected||{name:legacyConfigs[template]?.[0],primary:legacyConfigs[template]?.[1],secondary:legacyConfigs[template]?.[2],layout:legacyConfigs[template]?.[3],headline:legacyConfigs[template]?.[4]}
  const hero = menuItems[(layout * 2) % Math.max(menuItems.length, 1)] || menuItems[0]
  const [loadedHero,setLoadedHero]=useState('')
  const heroLoaded=loadedHero===hero?.image
  return <div className={`future-site future-layout-${layout} ${template}`} style={{ '--future-primary': primary, '--future-secondary': secondary }}><OfferSection onMenu={onMenu} variant="future" content={content} />
    <nav className="future-nav"><a href="#future-home"><img src={logoUrl||'/default-restaurant-logo.svg'} onError={event=>{event.currentTarget.src='/default-restaurant-logo.svg'}} alt=""/><b>{restaurantName}</b></a><div><a href="#future-home">Home</a><a href="#offers">Offers</a><a href="#future-menu">Menu</a><a href="#future-system">Experience</a></div><span className="future-nav-actions"><button onClick={onMenu}>Order now</button><button className="future-cart-icon" onClick={onCart} aria-label={`Open cart with ${cartCount} items`}><ShoppingBag size={16}/>{cartCount>0&&<b>{cartCount}</b>}</button></span></nav>
    <section className="future-hero" id="future-home"><div className="future-grid-lines" /><div className="future-copy"><span><Radio size={12} /> System online · {outlet}</span><h1>{headline}</h1><p>{restaurantName} reimagines dining with bold ingredients, kinetic presentation, and dishes engineered for delight.</p><div><button onClick={onMenu}>Launch menu <ArrowRight size={15} /></button><a href="#future-system">Explore experience</a></div><aside><b>4.9</b><span><Star size={11} fill="currentColor" /> Guest signal</span><b>20m</b><span><Clock3 size={11} /> Kitchen cycle</span></aside></div><div className={`future-visual ${heroLoaded?'image-ready':'image-loading'}`}><div className="future-orbit"><i /><i /><i /></div><div className="future-image-skeleton" aria-hidden="true"><i/><i/><i/></div><img src={hero?.image} alt={hero?.name || 'Futuristic signature dish'} onLoad={()=>setLoadedHero(hero?.image)} /><span><Cpu size={14} /> Signature {String(layout).padStart(2,'0')}</span></div></section>
    <section className="future-marquee"><span>{name}</span><i />NEXT-GEN DINING<i />LIVE KITCHEN<i />{outlet}<i />FLAVOUR PROTOCOL</section>
    <section className="future-menu" id="future-menu"><header><div><span>Curated selection</span><h2>Choose your next experience</h2></div><p>Freshly prepared dishes transmitted directly from our kitchen to your table.</p></header><CategoryTabs categories={categories} activeCategory={category} onChange={onCategoryChange} /><div className="future-food-grid">{menuItems.map((item, index) => <div className={`future-card-wrap card-${index + 1}`} key={item.id || item.name}><FoodCard item={item} onSelect={onSelect} onAdd={onAdd} /></div>)}</div><MenuPagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} /></section>
    <section className="future-system" id="future-system"><div className="future-core"><Orbit size={90} /><span /><i /></div><div><span>Experience protocol</span><h2>Designed around<br />your appetite.</h2>{[[Zap, 'Instant ordering', 'Tap, choose, and transmit your order.'], [Bot, 'Smart kitchen', 'Live preparation with precise timing.'], [Sparkles, 'Sensory plates', 'Unexpected texture, colour, and flavour.']].map(([Icon, title, copy], index) => <article key={title}><b>0{index + 1}</b><Icon size={17} /><div><strong>{title}</strong><small>{copy}</small></div><ChevronRight size={14} /></article>)}</div></section>
    <footer className="future-footer"><a href="#future-home"><Atom size={17} />{name}</a><p>{restaurantName} · {outlet} node</p><button onClick={onMenu}>Initialize order <ArrowRight size={13} /></button></footer>
  </div>
}
