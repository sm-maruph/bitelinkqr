import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Download, ExternalLink, Plus, QrCode, Table2, X } from 'lucide-react'
import QRCode from 'qrcode'
import useWorkspaceData from '../hooks/useWorkspaceData'
import { Header } from './PortalChrome'
import { useAuth } from '../contexts/AuthContext'
import { workspaceService } from '../services/workspaceService'

function TableQr({table,restaurantSlug,outletSlug}) {
  const [image,setImage]=useState('')
  const [copied,setCopied]=useState(false)
  const link=useMemo(()=>`${window.location.origin}/${restaurantSlug}/${outletSlug}/table/${encodeURIComponent(table.table_number)}`,[restaurantSlug,outletSlug,table.table_number])
  useEffect(()=>{let active=true;QRCode.toDataURL(link,{width:320,margin:2,color:{dark:'#17382e',light:'#ffffff'},errorCorrectionLevel:'H'}).then(value=>{if(active)setImage(value)});return()=>{active=false}},[link])
  const copy=async()=>{await navigator.clipboard.writeText(link);setCopied(true);window.setTimeout(()=>setCopied(false),1600)}
  const download=()=>{const anchor=document.createElement('a');anchor.href=image;anchor.download=`${restaurantSlug}-${outletSlug}-table-${table.table_number}-qr.png`;anchor.click()}
  return <article className="table-qr-card"><div className="table-qr-heading"><span><Table2 size={18}/></span><div><small>TABLE</small><strong>{table.table_number}</strong></div><em>{table.capacity} seats</em></div><div className="table-qr-image">{image?<img src={image} alt={`Customer QR code for table ${table.table_number}`}/>:<div className="table-qr-skeleton"/>}</div><label>Customer ordering link<input value={link} readOnly/></label><div className="table-qr-actions"><button onClick={copy}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy link'}</button><button onClick={download} disabled={!image}><Download size={15}/> Download QR</button><a href={link} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Preview</a></div></article>
}

export default function QrCodesPage({context}) {
  const {session}=useAuth()
  const {data,loading,error}=useWorkspaceData(context)
  const [createdTables,setCreatedTables]=useState([])
  const [adding,setAdding]=useState(false)
  const [saving,setSaving]=useState(false)
  const [form,setForm]=useState({tableNumber:'',capacity:4})
  const [formError,setFormError]=useState('')
  const tables=[...(data?.tables||[]),...createdTables].sort((a,b)=>String(a.table_number).localeCompare(String(b.table_number),undefined,{numeric:true}))
  const restaurantSlug=data?.restaurant?.slug||context.restaurantId
  const outletSlug=data?.restaurant?.outlet_slug||String(context.outlet||'').toLowerCase().trim().replaceAll(/\s+/g,'-')
  const createTable=async(event)=>{event.preventDefault();setFormError('');setSaving(true);try{const created=await workspaceService.createTable(session,context.tenantId,{restaurantId:context.restaurantUuid,outletId:context.outletId,tableNumber:form.tableNumber,capacity:Number(form.capacity)});setCreatedTables(current=>[...current,created]);setForm({tableNumber:'',capacity:4});setAdding(false)}catch(requestError){setFormError(requestError?.status===409?'That table number already exists in this outlet.':'Could not create the table. Check the number and capacity, then try again.')}finally{setSaving(false)}}
  return <><Header eyebrow={`${context.outlet} outlet / Customer access`} title="Table QR codes" action="Add table" onAction={()=>setAdding(true)}/><section className="qr-intro"><QrCode size={21}/><div><b>One customer link for every table</b><p>Guests scan the code to open this restaurant, outlet, and table directly. Print or download each QR and place it on the matching table.</p></div></section>{loading&&<div className="qr-grid">{Array.from({length:6},(_,index)=><div className="table-qr-card qr-card-loading" key={index}><i/><i/><i/></div>)}</div>}{error&&<div className="panel state-message" role="alert"><b>{error}</b></div>}{!loading&&!error&&!tables.length&&<div className="panel state-message"><b>No tables exist for this outlet yet.</b><p>Use Add table to create the first table and customer QR code.</p></div>}{!loading&&!error&&tables.length>0&&<div className="qr-grid">{tables.map(table=><TableQr key={table.id} table={table} restaurantSlug={restaurantSlug} outletSlug={outletSlug}/>)}</div>}{adding&&<div className="qr-modal-backdrop" onClick={()=>!saving&&setAdding(false)}><form className="qr-table-modal" onSubmit={createTable} onClick={event=>event.stopPropagation()}><div className="qr-modal-heading"><div><span>OUTLET FLOOR</span><h2>Add a table</h2></div><button type="button" onClick={()=>setAdding(false)} aria-label="Close add table"><X size={18}/></button></div><p>Create a table for <b>{context.outlet}</b>. Its customer ordering link and QR code will be generated automatically.</p><div className="qr-form-grid"><label>Table number<input autoFocus required maxLength="20" pattern="[A-Za-z0-9_-]+" value={form.tableNumber} onChange={event=>setForm(current=>({...current,tableNumber:event.target.value}))} placeholder="e.g. 01 or Patio-2"/></label><label>Seating capacity<input required type="number" min="1" max="50" value={form.capacity} onChange={event=>setForm(current=>({...current,capacity:event.target.value}))}/></label></div>{formError&&<div className="qr-form-error" role="alert">{formError}</div>}<div className="qr-modal-actions"><button type="button" onClick={()=>setAdding(false)} disabled={saving}>Cancel</button><button type="submit" disabled={saving}><Plus size={15}/>{saving?'Creating table…':'Create table'}</button></div></form></div>}</>
}
