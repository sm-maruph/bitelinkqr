import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Download, ExternalLink, Pencil, Plus, QrCode, Table2, Trash2, X } from 'lucide-react'
import QRCode from 'qrcode'
import useWorkspaceData from '../hooks/useWorkspaceData'
import { Header } from './PortalChrome'
import { useAuth } from '../contexts/AuthContext'
import { workspaceService } from '../services/workspaceService'

function TableQr({ table, restaurantSlug, outletSlug, onEdit, onDelete, busy }) {
  const [image, setImage] = useState('')
  const [copied, setCopied] = useState(false)
  const link = useMemo(() => `${window.location.origin}/${restaurantSlug}/${outletSlug}/table/${encodeURIComponent(table.table_number)}?access=${encodeURIComponent(table.qr_token)}`, [restaurantSlug, outletSlug, table.table_number, table.qr_token])

  useEffect(() => {
    let active = true
    QRCode.toDataURL(link, { width: 320, margin: 2, color: { dark: '#17382e', light: '#ffffff' }, errorCorrectionLevel: 'H' })
      .then(value => { if (active) setImage(value) })
    return () => { active = false }
  }, [link])

  const copy = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  const download = () => {
    const anchor = document.createElement('a')
    anchor.href = image
    anchor.download = `${restaurantSlug}-${outletSlug}-table-${table.table_number}-qr.png`
    anchor.click()
  }

  return <article className="table-qr-card">
    <div className="table-qr-heading"><span><Table2 size={18} /></span><div><small>TABLE</small><strong>{table.table_number}</strong></div><em>{table.capacity} seats</em></div>
    <div className="table-qr-image">{image ? <img src={image} alt={`Customer QR code for table ${table.table_number}`} /> : <div className="table-qr-skeleton" />}</div>
    <label>Customer ordering link<input value={link} readOnly /></label>
    <div className="table-qr-actions">
      <button onClick={copy}>{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy link'}</button>
      <button onClick={download} disabled={!image}><Download size={15} /> Download QR</button>
      <a href={link} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Preview</a>
      <button onClick={() => onEdit(table)} disabled={busy}><Pencil size={15} /> Edit</button>
      <button className="danger" onClick={() => onDelete(table)} disabled={busy}><Trash2 size={15} /> Delete</button>
    </div>
  </article>
}

export default function QrCodesPage({ context }) {
  const { session } = useAuth()
  const { data, loading, error } = useWorkspaceData(context)
  const [createdTables, setCreatedTables] = useState([])
  const [changedTables, setChangedTables] = useState({})
  const [removedIds, setRemovedIds] = useState([])
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ tableNumber: '', capacity: 4 })
  const [formError, setFormError] = useState('')

  const tables = [...(data?.tables || []), ...createdTables]
    .filter(table => !removedIds.includes(table.id))
    .map(table => changedTables[table.id] || table)
    .sort((a, b) => String(a.table_number).localeCompare(String(b.table_number), undefined, { numeric: true }))
  const restaurantSlug = data?.restaurant?.slug || context.restaurantId
  const outletSlug = data?.restaurant?.outlet_slug || String(context.outlet || '').toLowerCase().trim().replaceAll(/\s+/g, '-')
  const updateForm = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const closeModal = () => { if (!saving) { setAdding(false); setEditing(null); setFormError('') } }

  const createTable = async event => {
    event.preventDefault()
    setFormError(''); setSaving(true)
    try {
      const created = await workspaceService.createTable(session, context.tenantId, { restaurantId: context.restaurantUuid, outletId: context.outletId, tableNumber: form.tableNumber, capacity: Number(form.capacity) })
      setCreatedTables(current => [...current, created])
      setForm({ tableNumber: '', capacity: 4 }); setAdding(false); setNotice(`Table ${created.table_number} and its QR code are ready.`)
    } catch (requestError) {
      setFormError(requestError?.status === 409 ? 'That table number already exists in this outlet.' : 'Could not create the table. Check the number and capacity, then try again.')
    } finally { setSaving(false) }
  }
  const startEdit = table => { setEditing(table); setForm({ tableNumber: table.table_number, capacity: table.capacity }); setFormError('') }
  const saveEdit = async event => {
    event.preventDefault()
    setFormError(''); setSaving(true)
    try {
      const updated = await workspaceService.updateTable(session, context.tenantId, editing.id, { tableNumber: form.tableNumber, capacity: Number(form.capacity) })
      setChangedTables(current => ({ ...current, [updated.id]: updated }))
      setEditing(null); setNotice(`Table ${updated.table_number} has been updated.`)
    } catch (requestError) {
      setFormError(requestError?.status === 409 ? 'That table number already exists in this outlet.' : 'Could not update this table. Please try again.')
    } finally { setSaving(false) }
  }
  const deleteTable = async table => {
    if (!window.confirm(`Delete table ${table.table_number}? Its customer QR link will stop working.`)) return
    setSaving(true); setNotice('')
    try {
      await workspaceService.deleteTable(session, context.tenantId, table.id)
      setRemovedIds(current => [...current, table.id])
      setNotice(`Table ${table.table_number} was deleted.`)
    } catch { setNotice('Could not delete this table. Please try again.') } finally { setSaving(false) }
  }

  const modalOpen = adding || editing
  return <>
    <Header eyebrow={`${context.outlet} outlet / Customer access`} title="Table QR codes" action="Add table" onAction={() => { setForm({ tableNumber: '', capacity: 4 }); setAdding(true) }} />
    {notice && <div className="management-notice">{notice}</div>}
    <section className="qr-intro"><QrCode size={21} /><div><b>One customer link for every table</b><p>Guests scan the code to open this restaurant, outlet, and table directly. Print or download each QR and place it on the matching table.</p></div></section>
    {loading && <div className="qr-grid">{Array.from({ length: 6 }, (_, index) => <div className="table-qr-card qr-card-loading" key={index}><i /><i /><i /></div>)}</div>}
    {error && <div className="panel state-message" role="alert"><b>{error}</b></div>}
    {!loading && !error && !tables.length && <div className="panel state-message"><b>No tables exist for this outlet yet.</b><p>Use Add table to create the first table and customer QR code.</p></div>}
    {!loading && !error && tables.length > 0 && <div className="qr-grid">{tables.map(table => <TableQr key={table.id} table={table} restaurantSlug={restaurantSlug} outletSlug={outletSlug} onEdit={startEdit} onDelete={deleteTable} busy={saving} />)}</div>}
    {modalOpen && <div className="qr-modal-backdrop" onClick={closeModal}><form className="qr-table-modal" onSubmit={editing ? saveEdit : createTable} onClick={event => event.stopPropagation()}><div className="qr-modal-heading"><div><span>OUTLET FLOOR</span><h2>{editing ? `Edit table ${editing.table_number}` : 'Add a table'}</h2></div><button type="button" onClick={closeModal} aria-label="Close table form"><X size={18} /></button></div><p>{editing ? 'Change this table’s identifier or seating capacity.' : <>Create a table for <b>{context.outlet}</b>. Its customer ordering link and QR code will be generated automatically.</>}</p><div className="qr-form-grid"><label>Table number<input autoFocus required maxLength="20" pattern="[A-Za-z0-9_-]+" value={form.tableNumber} onChange={event => updateForm('tableNumber', event.target.value)} placeholder="e.g. 01 or Patio-2" /></label><label>Seating capacity<input required type="number" min="1" max="50" value={form.capacity} onChange={event => updateForm('capacity', event.target.value)} /></label></div>{formError && <div className="qr-form-error" role="alert">{formError}</div>}<div className="qr-modal-actions"><button type="button" onClick={closeModal} disabled={saving}>Cancel</button><button type="submit" disabled={saving}>{editing ? <Pencil size={15} /> : <Plus size={15} />}{saving ? 'Saving…' : editing ? 'Save changes' : 'Create table'}</button></div></form></div>}
  </>
}
