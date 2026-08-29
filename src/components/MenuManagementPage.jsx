import { useEffect, useState } from 'react'
import { Image, Percent, Pencil, Plus, Tags, Trash2, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import useWorkspaceData from '../hooks/useWorkspaceData'
import { managementService } from '../services/managementService'
import { Button, Header } from './PortalChrome'
import AdminOfferBuilder from './OfferBuilder'

const slugify = value => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const money = value => `BDT ${Number(value || 0).toLocaleString('en-BD')}`
const blankItem = { name: '', slug: '', description: '', imageUrl: '', basePrice: '', preparationMinutes: 20, featured: false, categoryId: '', universal: false }
const MenuCardSkeleton = () => <article className="menu-card-skeleton" aria-hidden="true"><i className="menu-skeleton-image" /><div><i className="menu-skeleton-kicker" /><i className="menu-skeleton-title" /><i className="menu-skeleton-meta" /><footer><i className="menu-skeleton-price" /><i className="menu-skeleton-status" /></footer></div></article>
const MenuGridSkeleton = () => <section className="admin-menu-grid menu-grid-skeleton" role="status" aria-label="Loading menu"><span className="sr-only">Loading menu</span>{Array.from({ length: 8 }, (_, index) => <MenuCardSkeleton key={index} />)}</section>
function OfferBuilder({offer,setOffer,items,busy,onClose,onSave}){return <div className="staff-modal-backdrop" onMouseDown={event=>event.target===event.currentTarget&&!busy&&onClose()}><section className="staff-modal offer-builder-modal"><header><div><span className="page-eyebrow">Menu promotion</span><h2>Create quantity discount</h2></div><button onClick={onClose} aria-label="Close"><X/></button></header><form onSubmit={onSave}><div className="staff-fields"><label><span>Offer name</span><input required value={offer.name} onChange={event=>setOffer({...offer,name:event.target.value})}/></label><label className="wide"><span>Customer message</span><input value={offer.description} onChange={event=>setOffer({...offer,description:event.target.value})} placeholder="Buy 2 for 10% off, buy 3 for 15% off"/></label><fieldset className="offer-item-picker wide"><legend>Eligible menu items</legend>{items.map(entry=><label key={entry.id}><input type="checkbox" checked={offer.menuItemIds.includes(entry.id)} onChange={event=>setOffer({...offer,menuItemIds:event.target.checked?[...offer.menuItemIds,entry.id]:offer.menuItemIds.filter(id=>id!==entry.id)})}/><span>{entry.name}</span><small>{money(entry.price)}</small></label>)}</fieldset><div className="offer-tier-editor wide"><span>Quantity discount tiers</span>{offer.tiers.map((tier,index)=><div key={index}><label>Minimum quantity<input required min="2" max="99" type="number" value={tier.quantity} onChange={event=>setOffer({...offer,tiers:offer.tiers.map((item,i)=>i===index?{...item,quantity:event.target.value}:item)})}/></label><label>Discount percent<input required min="1" max="100" type="number" value={tier.percent} onChange={event=>setOffer({...offer,tiers:offer.tiers.map((item,i)=>i===index?{...item,percent:event.target.value}:item)})}/></label></div>)}<button type="button" className="trial-add" onClick={()=>setOffer({...offer,tiers:[...offer.tiers,{quantity:'',percent:''}]})}><Plus size={14}/> Add tier</button></div><div className="offer-preview wide"><Percent size={19}/><span><b>Customer preview</b><small>{offer.tiers.filter(tier=>tier.quantity&&tier.percent).map(tier=>`Order ×${tier.quantity} for ${tier.percent}% off`).join(' · ')}</small></span></div></div><footer><button type="button" onClick={onClose}>Cancel</button><Button className="primary" disabled={busy||!offer.menuItemIds.length}>{busy?'Creating…':'Create & publish offer'}</Button></footer></form></section></div>}

export default function MenuManagementPage({ context }) {
  const { session } = useAuth()
  const { data, loading, error } = useWorkspaceData(context)
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState('All items')
  const [modal, setModal] = useState('')
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [category, setCategory] = useState({ name: '', slug: '', description: '' })
  const [item, setItem] = useState(blankItem)
  const [offerOpen,setOfferOpen]=useState(false)
  const [offer,setOffer]=useState({offerType:'quantity',name:'',description:'',menuItemIds:[],tiers:[{quantity:2,percent:10},{quantity:3,percent:15}],comboPrice:''})
  const [offers,setOffers]=useState([])
  const canPublishRestaurantWide = ['owner', 'manager'].includes(context.roleId)

  useEffect(() => { if (data?.menu) setItems(data.menu) }, [data])
  useEffect(()=>{if(data?.offers)setOffers(data.offers)},[data?.offers])
  const loadCategories = () => managementService.categories(session, context.tenantId, context.restaurantUuid)
    .then(result => { setCategories(result.items); setItem(current => ({ ...current, categoryId: current.categoryId || result.items[0]?.id || '' })) })
    .catch(() => setNotice('Could not load menu categories.'))
  useEffect(() => { if (session && context.restaurantUuid) loadCategories() }, [session, context.restaurantUuid])

  const saveCategory = async event => {
    event.preventDefault(); setBusy(true); setNotice('')
    try {
      const created = await managementService.createCategory(session, context.tenantId, { ...category, restaurantId: context.restaurantUuid, outletId: context.outletId })
      setCategories(current => [...current, created]); setItem(current => ({ ...current, categoryId: created.id })); setCategory({ name: '', slug: '', description: '' }); setModal('item')
      setNotice('Category created. You can now add its first menu item.')
    } catch (requestError) { setNotice(requestError.status === 409 ? 'A category with this slug already exists.' : 'Could not create the category.') } finally { setBusy(false) }
  }
  const saveItem = async event => {
    event.preventDefault(); setBusy(true); setNotice('')
    try {
      const created = await managementService.createItem(session, context.tenantId, { ...item, universal: canPublishRestaurantWide && item.universal, restaurantId: context.restaurantUuid, outletId: context.outletId, basePrice: Number(item.basePrice), preparationMinutes: Number(item.preparationMinutes) })
      const selected = categories.find(entry => entry.id === item.categoryId)
      setItems(current => [...current, { ...created, price: created.base_price, category_name: selected?.name, availability: 'available' }])
      setItem(current => ({ ...blankItem, categoryId: current.categoryId })); setModal('')
      setNotice(item.universal ? 'Menu item published at every outlet.' : `Menu item published for ${context.outlet}.`)
    } catch (requestError) { setNotice(requestError.status === 409 ? 'A menu item with this slug already exists.' : 'Could not create the menu item.') } finally { setBusy(false) }
  }
  const toggleAvailability = async entry => {
    const availability = entry.availability === 'available' ? 'sold_out' : 'available'
    setItems(current => current.map(item => item.id === entry.id ? { ...item, availability } : item))
    try {
      await managementService.setAvailability(session, context.tenantId, entry.id, { availability, outletId: context.outletId })
      setNotice(`${entry.name} is now ${availability.replace('_', ' ')} at ${context.outlet}.`)
    } catch {
      setItems(current => current.map(item => item.id === entry.id ? { ...item, availability: entry.availability } : item)); setNotice('Could not update menu availability.')
    }
  }
  const startEdit = entry => {
    setEditing(entry)
    setItem({ name: entry.name || '', slug: entry.slug || '', description: entry.description || '', imageUrl: entry.image_url || '', basePrice: String(entry.price ?? entry.base_price ?? ''), preparationMinutes: entry.preparation_minutes || 20, featured: Boolean(entry.is_featured), categoryId: entry.category_id || '', universal: false })
    setModal('edit')
  }
  const saveEdit = async event => {
    event.preventDefault(); setBusy(true); setNotice('')
    try {
      const updated = await managementService.updateItem(session, context.tenantId, editing.id, { name: item.name, description: item.description, imageUrl: item.imageUrl, basePrice: Number(item.basePrice), preparationMinutes: Number(item.preparationMinutes) })
      setItems(current => current.map(entry => entry.id === editing.id ? { ...entry, ...updated, price: updated.base_price ?? updated.price } : entry))
      setModal(''); setEditing(null); setNotice(`${updated.name} has been updated.`)
    } catch { setNotice('Could not update this menu item. Please try again.') } finally { setBusy(false) }
  }
  const deleteItem = async entry => {
    if (!window.confirm(`Delete “${entry.name}”? This cannot be undone.`)) return
    setBusy(true); setNotice('')
    try { await managementService.deleteItem(session, context.tenantId, entry.id); setItems(current => current.filter(item => item.id !== entry.id)); setNotice(`${entry.name} was deleted.`) }
    catch { setNotice('Could not delete this menu item. Please try again.') } finally { setBusy(false) }
  }
  const closeModal = () => { if (!busy) { setModal(''); setEditing(null) } }
  const blankOffer=()=>({offerType:'quantity',name:'',description:'',menuItemIds:[],tiers:[{quantity:2,percent:10},{quantity:3,percent:15}],comboPrice:''})
  const startOfferEdit=entry=>{setOffer({id:entry.id,offerType:entry.offer_type==='combo'?'combo':'quantity',name:entry.name,description:entry.description||'',menuItemIds:entry.rules?.menuItemIds||[],tiers:entry.rules?.tiers?.length?entry.rules.tiers:[{quantity:2,percent:10},{quantity:3,percent:15}],comboPrice:entry.rules?.comboPrice||'',isActive:entry.is_active!==false});setOfferOpen(true)}
  const saveOffer=async event=>{event.preventDefault();setBusy(true);setNotice('');try{const payload={...offer,restaurantId:context.restaurantUuid,outletId:context.outletId},saved=offer.id?await managementService.updateOffer(session,context.tenantId,offer.id,payload):await managementService.createOffer(session,context.tenantId,payload);setOffers(current=>offer.id?current.map(entry=>entry.id===saved.id?saved:entry):[saved,...current]);setNotice(`${saved.name} has been ${offer.id?'updated':'created'} successfully.`);setOfferOpen(false);setOffer(blankOffer())}catch{setNotice('Could not save this offer.')}finally{setBusy(false)}}
  const visible = filter === 'All items' ? items : items.filter(entry => entry.category_name === filter)
  const isItemForm = modal === 'item' || modal === 'edit'

  return <>
    <Header eyebrow={`Catalog / ${context.outlet} outlet`} title="Menu & offers" action="Add menu item" onAction={() => setModal(categories.length ? 'item' : 'category')} />
    {notice && <div className="management-notice">{notice}</div>}
    {offerOpen&&<AdminOfferBuilder offer={offer} setOffer={setOffer} items={items} busy={busy} onClose={()=>!busy&&setOfferOpen(false)} onSave={saveOffer}/>} 
    {error && <div className="panel state-message"><b>{error}</b></div>}
    <div className="menu-toolbar"><div className="category-pills">{['All items', ...categories.map(entry => entry.name)].map(name => <button className={filter === name ? 'active' : ''} onClick={() => setFilter(name)} key={name}>{name}</button>)}</div><Button className="filter-button" onClick={() => setModal('category')}><Plus size={15} /> Category</Button><Button className="filter-button" onClick={()=>{setOffer(blankOffer());setOfferOpen(true)}}><Tags size={15} /> Create offer <b>{offers.length}</b></Button></div>
    {offers.length>0&&<section className="admin-offer-list"><header><div><span className="panel-kicker">Active promotions</span><h2>Offers</h2></div><button onClick={()=>{setOffer(blankOffer());setOfferOpen(true)}}><Plus size={14}/> New offer</button></header><div>{offers.map(entry=><article key={entry.id}><Percent size={18}/><span><b>{entry.name}</b><small>{entry.offer_type==='combo'?`Combo · BDT ${Number(entry.rules?.comboPrice||entry.discount_value).toLocaleString()} · ${(entry.rules?.menuItemIds||[]).length} items`:`${(entry.rules?.tiers||[]).map(tier=>`×${tier.quantity}: ${tier.percent}% off`).join(' · ')} · ${(entry.rules?.menuItemIds||[]).length} items`}</small></span><em className={entry.is_active===false?'inactive':'active'}>{entry.is_active===false?'Inactive':'Active'}</em><button onClick={()=>startOfferEdit(entry)}><Pencil size={14}/> Edit</button></article>)}</div></section>}
    {loading ? <MenuGridSkeleton /> : <div className="admin-menu-grid">{visible.map(entry => <article className="admin-dish" key={entry.id}>{entry.image_url ? <img src={entry.image_url} alt={entry.name} /> : <div className="menu-image-empty"><Image /></div>}<div className="admin-dish-body"><span className="dish-tag">{entry.is_featured ? 'Featured' : 'Menu'}</span><h3>{entry.name}</h3><p>{entry.category_name}</p><div className="admin-dish-footer"><strong>{money(entry.price)}</strong><button className={`status ${entry.availability === 'available' ? 'green' : 'slate'}`} onClick={() => toggleAvailability(entry)} disabled={busy}>{entry.availability === 'available' ? 'Available' : 'Sold out'}</button></div><div className="admin-dish-actions"><button className="dish-availability" onClick={() => toggleAvailability(entry)} disabled={busy}>{entry.availability === 'available' ? 'Mark sold out' : 'Restore'}</button><button className="dish-icon-button" onClick={() => startEdit(entry)} disabled={busy} aria-label={`Edit ${entry.name}`}><Pencil size={14} /></button><button className="dish-icon-button danger" onClick={() => deleteItem(entry)} disabled={busy} aria-label={`Delete ${entry.name}`}><Trash2 size={14} /></button></div></div></article>)}</div>}
    {modal && <div className="staff-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && closeModal()}><section className="staff-modal"><header><div><span className="page-eyebrow">Menu management</span><h2>{modal === 'category' ? 'Create category' : modal === 'edit' ? `Edit ${editing?.name || 'menu item'}` : 'Add menu item'}</h2></div><button onClick={closeModal} aria-label="Close"><X /></button></header>{modal === 'category' ? <form onSubmit={saveCategory}><div className="staff-fields"><label><span>Category name</span><input required value={category.name} onChange={event => setCategory({ ...category, name: event.target.value, slug: slugify(event.target.value) })} /></label><label><span>Slug</span><input required value={category.slug} onChange={event => setCategory({ ...category, slug: slugify(event.target.value) })} /></label><label className="wide"><span>Description</span><input value={category.description} onChange={event => setCategory({ ...category, description: event.target.value })} /></label></div><footer><button type="button" onClick={closeModal}>Cancel</button><Button className="primary" disabled={busy}>{busy ? 'Creating…' : 'Create category'}</Button></footer></form> : <form onSubmit={isItemForm && modal === 'edit' ? saveEdit : saveItem}><div className="staff-fields"><label><span>Item name</span><input required value={item.name} onChange={event => setItem({ ...item, name: event.target.value, slug: slugify(event.target.value) })} /></label>{modal === 'item' && <label><span>Category</span><select required value={item.categoryId} onChange={event => setItem({ ...item, categoryId: event.target.value })}>{categories.map(entry => <option value={entry.id} key={entry.id}>{entry.name}</option>)}</select></label>}<label><span>Price (BDT)</span><input required min="0" type="number" value={item.basePrice} onChange={event => setItem({ ...item, basePrice: event.target.value })} /></label><label><span>Preparation minutes</span><input min="0" type="number" value={item.preparationMinutes} onChange={event => setItem({ ...item, preparationMinutes: event.target.value })} /></label><label className="wide"><span>Image URL</span><input type="url" value={item.imageUrl} onChange={event => setItem({ ...item, imageUrl: event.target.value })} /></label><label className="wide"><span>Description</span><input value={item.description} onChange={event => setItem({ ...item, description: event.target.value })} /></label>{modal === 'item' && <><label className="trial-check wide"><input type="checkbox" checked={item.featured} onChange={event => setItem({ ...item, featured: event.target.checked })} /> Featured menu item</label>{canPublishRestaurantWide && <label className="trial-check wide"><input type="checkbox" checked={item.universal} onChange={event => setItem({ ...item, universal: event.target.checked })} /> Publish this item at every restaurant outlet</label>}</>}</div><footer><button type="button" onClick={closeModal}>Cancel</button><Button className="primary" disabled={busy}>{busy ? 'Saving…' : modal === 'edit' ? 'Save changes' : 'Publish item'}</Button></footer></form>}</section></div>}
  </>
}
