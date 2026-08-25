import { Clock3, Plus } from 'lucide-react'

export default function FoodCard({ item, onSelect, onAdd }) {
  const soldOut = item.availability === 'SOLD_OUT'
  return <article className={`customer-dish ${soldOut ? 'sold-out' : ''}`}><button className="food-card-image" onClick={() => onSelect(item)} aria-label={`View ${item.name} details`}><img src={item.image} alt={item.name} /><span>{soldOut ? 'Sold out' : item.tag}</span></button><button className="food-card-copy" onClick={() => onSelect(item)}><h3>{item.name}</h3><p>{item.description || `${item.category} favourite`}</p><div><strong>BDT {item.price}</strong><span><Clock3 size={12} /> {item.preparationTime || 20} min</span></div></button><button className="customer-add-button" disabled={soldOut} onClick={() => onAdd(item)}>{soldOut ? 'Sold out' : 'Add to order'} {!soldOut && <Plus size={14} />}</button></article>
}
