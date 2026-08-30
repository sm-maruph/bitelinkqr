import { useState } from 'react'
import { ArrowRight, BadgePercent, Clock3, Flame, Plus } from 'lucide-react'

export default function FoodCard({ item, onSelect, onAdd }) {
  const [loadedSrc,setLoadedSrc]=useState('')
  if(item.emptyOffer){const EmptyIcon=item.emptyKind==='popular'?Flame:BadgePercent;return <section className="offer-menu-empty"><EmptyIcon size={28}/><span>{item.emptyLabel||'Offers'}</span><h3>{item.emptyTitle||'Currently we have no offers for you.'}</h3><p>{item.emptyDescription||'Our full menu is still available. Explore the dishes and choose something you’ll love.'}</p><button onClick={item.onViewMenu}>View the menu <ArrowRight size={15}/></button></section>}
  if(item.comboOffer)return <article className="customer-dish combo-offer-card"><button className="food-card-image" onClick={()=>onSelect(item)}><img src={item.image} alt=""/><span className="dish-label">Combo offer</span></button><button className="food-card-copy" onClick={()=>onSelect(item)}><h3>{item.name}</h3><p>{item.description||item.comboItems.map(entry=>entry.name).join(' + ')}</p><span className="combo-item-count">{item.comboItems.length} dishes included</span><div><strong>BDT {item.price}</strong><del>BDT {item.regularPrice}</del></div></button><button className="customer-add-button" onClick={()=>onSelect(item)}>View details <ArrowRight size={14}/></button></article>
  const soldOut=item.availability==='SOLD_OUT',loaded=loadedSrc===item.image
  return <article className={`customer-dish ${soldOut?'sold-out':''}`}>
    {item.popularNow&&<span className="popular-fire" title={`Popular now · ${item.quantityOrdered} ordered`} aria-label={`Popular now, ${item.quantityOrdered} ordered`}><Flame size={19} fill="currentColor"/></span>}
    <button className={`food-card-image ${loaded?'image-ready':'image-loading'}`} onClick={()=>onSelect(item)} aria-label={`View ${item.name} details`}><div className="food-image-skeleton" aria-hidden="true"><i/><i/><i/></div><img src={item.image} alt={item.name} onLoad={()=>setLoadedSrc(item.image)}/><span className="dish-label">{soldOut?'Sold out':item.tag}</span></button>
    <button className="food-card-copy" onClick={()=>onSelect(item)}><h3>{item.name}</h3><p>{item.description||`${item.category} favourite`}</p><span className={`item-offer-slot ${item.offers?.[0]?.tiers?.length?'has-offer':''}`} aria-hidden={!item.offers?.[0]?.tiers?.length}>{item.offers?.[0]?.tiers?.length>0&&<small className="item-offer-copy">{item.offers[0].tiers.map(tier=>`Order ×${tier.quantity} for ${tier.percent}% off`).join(' · ')}</small>}</span><div><strong>BDT {item.price}</strong><span><Clock3 size={12}/> {item.preparationTime||20} min</span></div></button>
    <button className="customer-add-button" disabled={soldOut} onClick={()=>onAdd(item)}>{soldOut?'Sold out':'Add to cart'} {!soldOut&&<Plus size={14}/>}</button>
  </article>
}
