import { useEffect, useState } from 'react'
import { Image, Pencil, Plus, Tags, Trash2, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import useWorkspaceData from '../hooks/useWorkspaceData'
import { managementService } from '../services/managementService'
import { Button, Header } from './PortalChrome'

const slugify = value => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const money = value => `BDT ${Number(value || 0).toLocaleString('en-BD')}`
const blankItem = { name: '', slug: '', description: '', imageUrl: '', basePrice: '', preparationMinutes: 20, featured: false, categoryId: '', universal: false }
const MenuCardSkeleton = () => <article className="menu-card-skeleton" aria-hidden="true"><i className="menu-skeleton-image" /><div><i className="menu-skeleton-kicker" /><i className="menu-skeleton-title" /><i className="menu-skeleton-meta" /><footer><i className="menu-skeleton-price" /><i className="menu-skeleton-status" /></footer></div></article>
const MenuGridSkeleton = () => <section className="admin-menu-grid menu-grid-skeleton" role="status" aria-label="Loading menu"><span className="sr-only">Loading menu</span>{Array.from({ length: 8 }, (_, index) => <MenuCardSkeleton key={index} />)}</section>

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
  const canPublishRestaurantWide = ['owner', 'manager'].includes(context.roleId)

  useEffect(() => { if (data?.menu) setItems(data.menu) }, [data])
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
  const visible = filter === 'All items' ? items : items.filter(entry => entry.category_name === filter)
  const isItemForm = modal === 'item' || modal === 'edit'

  return <>
    <Header eyebrow={`Catalog / ${context.outlet} outlet`} title="Menu & offers" action="Add menu item" onAction={() => setModal(categories.length ? 'item' : 'category')} />
    {notice && <div className="management-notice">{notice}</div>}
    {error && <div className="panel state-message"><b>{error}</b></div>}
    <div className="menu-toolbar"><div className="category-pills">{['All items', ...categories.map(entry => entry.name)].map(name => <button className={filter === name ? 'active' : ''} onClick={() => setFilter(name)} key={name}>{name}</button>)}</div><Button className="filter-button" onClick={() => setModal('category')}><Plus size={15} /> Category</Button><Button className="filter-button"><Tags size={15} /> Offers <b>{data?.offers?.length || 0}</b></Button></div>
    {loading ? <MenuGridSkeleton /> : <div className="admin-menu-grid">{visible.map(entry => <article className="admin-dish" key={entry.id}>{entry.image_url ? <img src={entry.image_url} alt={entry.name} /> : <div className="menu-image-empty"><Image /></div>}<div className="admin-dish-body"><span className="dish-tag">{entry.is_featured ? 'Featured' : 'Menu'}</span><h3>{entry.name}</h3><p>{entry.category_name}</p><div className="admin-dish-footer"><strong>{money(entry.price)}</strong><button className={`status ${entry.availability === 'available' ? 'green' : 'slate'}`} onClick={() => toggleAvailability(entry)} disabled={busy}>{entry.availability === 'available' ? 'Available' : 'Sold out'}</button></div><div className="admin-dish-actions"><button className="dish-availability" onClick={() => toggleAvailability(entry)} disabled={busy}>{entry.availability === 'available' ? 'Mark sold out' : 'Restore'}</button><button className="dish-icon-button" onClick={() => startEdit(entry)} disabled={busy} aria-label={`Edit ${entry.name}`}><Pencil size={14} /></button><button className="dish-icon-button danger" onClick={() => deleteItem(entry)} disabled={busy} aria-label={`Delete ${entry.name}`}><Trash2 size={14} /></button></div></div></article>)}</div>}
    {modal && <div className="staff-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && closeModal()}><section className="staff-modal"><header><div><span className="page-eyebrow">Menu management</span><h2>{modal === 'category' ? 'Create category' : modal === 'edit' ? `Edit ${editing?.name || 'menu item'}` : 'Add menu item'}</h2></div><button onClick={closeModal} aria-label="Close"><X /></button></header>{modal === 'category' ? <form onSubmit={saveCategory}><div className="staff-fields"><label><span>Category name</span><input required value={category.name} onChange={event => setCategory({ ...category, name: event.target.value, slug: slugify(event.target.value) })} /></label><label><span>Slug</span><input required value={category.slug} onChange={event => setCategory({ ...category, slug: slugify(event.target.value) })} /></label><label className="wide"><span>Description</span><input value={category.description} onChange={event => setCategory({ ...category, description: event.target.value })} /></label></div><footer><button type="button" onClick={closeModal}>Cancel</button><Button className="primary" disabled={busy}>{busy ? 'Creating…' : 'Create category'}</Button></footer></form> : <form onSubmit={isItemForm && modal === 'edit' ? saveEdit : saveItem}><div className="staff-fields"><label><span>Item name</span><input required value={item.name} onChange={event => setItem({ ...item, name: event.target.value, slug: slugify(event.target.value) })} /></label>{modal === 'item' && <label><span>Category</span><select required value={item.categoryId} onChange={event => setItem({ ...item, categoryId: event.target.value })}>{categories.map(entry => <option value={entry.id} key={entry.id}>{entry.name}</option>)}</select></label>}<label><span>Price (BDT)</span><input required min="0" type="number" value={item.basePrice} onChange={event => setItem({ ...item, basePrice: event.target.value })} /></label><label><span>Preparation minutes</span><input min="0" type="number" value={item.preparationMinutes} onChange={event => setItem({ ...item, preparationMinutes: event.target.value })} /></label><label className="wide"><span>Image URL</span><input type="url" value={item.imageUrl} onChange={event => setItem({ ...item, imageUrl: event.target.value })} /></label><label className="wide"><span>Description</span><input value={item.description} onChange={event => setItem({ ...item, description: event.target.value })} /></label>{modal === 'item' && <><label className="trial-check wide"><input type="checkbox" checked={item.featured} onChange={event => setItem({ ...item, featured: event.target.checked })} /> Featured menu item</label>{canPublishRestaurantWide && <label className="trial-check wide"><input type="checkbox" checked={item.universal} onChange={event => setItem({ ...item, universal: event.target.checked })} /> Publish this item at every restaurant outlet</label>}</>}</div><footer><button type="button" onClick={closeModal}>Cancel</button><Button className="primary" disabled={busy}>{busy ? 'Saving…' : modal === 'edit' ? 'Save changes' : 'Publish item'}</Button></footer></form>}</section></div>}
  </>
}
