import { ChevronRight, MapPin, Sparkles } from 'lucide-react'
import BistroLanding from './BistroLanding'
import ExpressLanding from './ExpressLanding'
import WorldPlateLanding from './WorldPlateLanding'
import SageLanding from './SageLanding'
import FuturisticLanding from './FuturisticLanding'
import EmberLanding from './EmberLanding'
import OfferSection from './OfferSection'

export default function CustomerHero({ template, restaurantName, outlet, menuItems, currentPage, pageCount, onPageChange, onSelect, onAdd, onMenu, categories, category, onCategoryChange }) {
  if (template.startsWith('future-')) return <FuturisticLanding template={template} restaurantName={restaurantName} outlet={outlet} onMenu={onMenu} menuItems={menuItems} currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} onSelect={onSelect} onAdd={onAdd} categories={categories} category={category} onCategoryChange={onCategoryChange} />
  if (template === 'midnight') return <BistroLanding restaurantName={restaurantName} outlet={outlet} onMenu={onMenu} menuItems={menuItems} currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} onSelect={onSelect} onAdd={onAdd} categories={categories} category={category} onCategoryChange={onCategoryChange} />
  if (template === 'express') return <ExpressLanding restaurantName={restaurantName} outlet={outlet} onMenu={onMenu} menuItems={menuItems} currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} onSelect={onSelect} onAdd={onAdd} categories={categories} category={category} onCategoryChange={onCategoryChange} />
  if (template === 'worldplate') return <WorldPlateLanding restaurantName={restaurantName} outlet={outlet} onMenu={onMenu} menuItems={menuItems} currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} onSelect={onSelect} onAdd={onAdd} categories={categories} category={category} onCategoryChange={onCategoryChange} />
  if (template === 'ember') return <EmberLanding restaurantName={restaurantName} outlet={outlet} onMenu={onMenu} menuItems={menuItems} currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} onSelect={onSelect} onAdd={onAdd} categories={categories} category={category} onCategoryChange={onCategoryChange} />
  if (template === 'sage') return <SageLanding restaurantName={restaurantName} outlet={outlet} onMenu={onMenu} menuItems={menuItems} currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} onSelect={onSelect} onAdd={onAdd} categories={categories} category={category} onCategoryChange={onCategoryChange} />
  return <>
    <div className="standard-customer-hero">
      <section className="customer-hero"><div><div className="eyebrow"><span className="live-dot" /> Open now <span className="eyebrow-line" /> 11:00 AM - 11:30 PM</div><p className="customer-restaurant-name">{restaurantName}</p><h1>A little<br /><em>more</em> flavour.</h1><p>Thoughtful plates, lively spices, and a table worth lingering at.</p><div className="location"><MapPin size={16} /> {outlet}, Dhaka <ChevronRight size={15} /></div></div><div className="customer-photo"><span className="photo-note"><Sparkles size={14} /> Made to order</span></div></section>
      <div className="customer-pulse"><span>25 - 35 min <b>kitchen pulse</b></span><button onClick={() => document.getElementById('requests')?.scrollIntoView({ behavior: 'smooth' })}>Need a hand? <b>Call your waiter</b></button><span>10% off our signatures</span></div>
      <OfferSection onMenu={onMenu} variant={template} />
    </div>
  </>
}
