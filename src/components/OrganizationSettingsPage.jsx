import { useEffect, useState } from 'react'
import { Building2, CheckCircle2, Clock3, ImageUp, Plus, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { managementService } from '../services/managementService'
import { Button, Header } from './PortalChrome'

const slugify = value => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const formatDate = value => value ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '—'
const getCountdown = (value, now) => {
  if (!value) return null
  const total = Math.max(0, new Date(value).getTime() - now)
  return { days: Math.floor(total / 86400000), hours: Math.floor(total % 86400000 / 3600000), minutes: Math.floor(total % 3600000 / 60000), seconds: Math.floor(total % 60000 / 1000) }
}

export default function OrganizationSettingsPage({ context }) {
  const { session } = useAuth()
  const [usage, setUsage] = useState(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [logo, setLogo] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [form, setForm] = useState({ restaurantId: context.restaurantUuid, name: '', slug: '', addressLine: '', city: 'Dhaka' })
  const isOutletManager = context.roleId === 'outlet'
  const load = () => managementService.usage(session, context.tenantId).then(setUsage).catch(() => setNotice('Could not load subscription details.'))

  useEffect(() => { if (session && context.tenantId) load() }, [session, context.tenantId])
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer) }, [])

  const submit = async event => {
    event.preventDefault(); setBusy(true); setNotice('')
    try { await managementService.requestOutlet(session, context.tenantId, form); setOpen(false); setNotice('Outlet request submitted for platform approval.'); load() }
    catch (error) { setNotice(error.payload?.error === 'outlet_limit_reached' ? `Your ${error.payload.plan} plan allows ${error.payload.limit} outlet(s), and all slots are used.` : 'Could not submit the outlet request.') }
    finally { setBusy(false) }
  }
  const saveLogo = async event => {
    const file = event.target.files?.[0]; if (!file) return
    setBusy(true); setNotice('')
    try { const asset = await managementService.uploadRestaurantLogo(session, context.tenantId, context.restaurantUuid, context.outletId, file); await managementService.updateRestaurantLogo(session, context.tenantId, context.restaurantUuid, { logoUrl: asset.url || asset.publicUrl, outletId: context.outletId }); setLogo(URL.createObjectURL(file)); setNotice('Restaurant logo updated.') }
    catch { setNotice('Could not upload the logo. Use PNG, JPG, WebP, or AVIF.') }
    finally { setBusy(false) }
  }

  const limit = usage?.limit_value === null ? 'Unlimited' : usage?.limit_value ?? '—'
  const endsAt = usage?.status === 'trialing' ? usage?.trial_ends_at : usage?.current_period_end
  const countdown = getCountdown(endsAt, now)
  const field = (label, key, props = {}) => <label><span>{label}</span><input required={key !== 'addressLine'} value={form[key]} onChange={event => setForm({ ...form, [key]: key === 'name' ? event.target.value : event.target.value, ...(key === 'name' ? { slug: slugify(event.target.value) } : {}) })} {...props} /></label>

  return <>
    <Header eyebrow="Account / Subscription" title="Restaurant settings" action={isOutletManager ? undefined : 'Request outlet'} onAction={() => setOpen(true)} />
    {notice && <div className="management-notice">{notice}</div>}
    <section className="subscription-usage">
      <article><Building2 /><span><small>Current plan</small><b>{usage?.plan_name || 'Loading…'}</b><em>{usage?.status === 'trialing' ? 'Free trial' : 'Subscription'}</em></span></article>
      <article><Clock3 /><span><small>{usage?.status === 'trialing' ? 'Trial ends' : 'Next due date'}</small><b>{formatDate(endsAt)}</b>{usage?.status === 'trialing' && countdown ? <div className="trial-countdown" aria-label={`${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes remaining`}>{[['days', countdown.days], ['hrs', countdown.hours], ['min', countdown.minutes], ['sec', countdown.seconds]].map(([label, value], index) => <><span key={label}><b>{String(value).padStart(2, '0')}</b><small>{label}</small></span>{index < 3 && <i key={`${label}-separator`}>:</i>}</>)}</div> : <em>Payment due on this date</em>}</span></article>
      <article><CheckCircle2 /><span><small>Outlet allowance</small><b>{usage?.total || 0} / {limit}</b><em>{usage?.pending || 0} awaiting approval</em></span></article>
    </section>
    <section className="panel settings-logo"><div><span className="panel-kicker">Restaurant identity</span><h2>Restaurant logo</h2><p>Shown on the customer experience and restaurant workspace.</p></div><label className="logo-upload">{logo ? <img src={logo} alt="New restaurant logo" /> : <ImageUp size={23} />}<span>{busy ? 'Uploading…' : 'Upload logo'}</span><input type="file" accept="image/png,image/jpeg,image/webp,image/avif" disabled={busy} onChange={saveLogo} /></label></section>
    <div className="panel settings-outlets"><div className="panel-heading"><div><span className="panel-kicker">Subscription controlled</span><h2>{isOutletManager ? 'Your assigned outlet' : 'Your outlets'}</h2></div></div>{context.restaurants.flatMap(restaurant => restaurant.outlets.filter(outlet => !isOutletManager || outlet.id === context.outletId).map(outlet => <div className="settings-outlet" key={outlet.id}><span className="restaurant-avatar">{outlet.name[0]}</span><div><b>{outlet.name}</b><small>{restaurant.name}</small></div><span className={`status ${outlet.status === 'active' ? 'green' : 'amber'}`}>{outlet.status === 'setup' ? 'Pending approval' : outlet.status}</span></div>))}</div>
    {open && <div className="staff-modal-backdrop"><section className="staff-modal"><header><div><span className="page-eyebrow">Subscription outlet request</span><h2>Request a new outlet</h2></div><button onClick={() => setOpen(false)}><X /></button></header><form onSubmit={submit}><div className="staff-fields"><label><span>Restaurant</span><select value={form.restaurantId} onChange={event => setForm({ ...form, restaurantId: event.target.value })}>{context.restaurants.map(restaurant => <option value={restaurant.id} key={restaurant.id}>{restaurant.name}</option>)}</select></label>{field('Outlet name', 'name')}{field('Outlet slug', 'slug')}{field('City', 'city')}{field('Address', 'addressLine', { className: 'wide' })}</div><footer><button type="button" onClick={() => setOpen(false)}>Cancel</button><Button className="primary" disabled={busy}><Plus size={15} />{busy ? 'Submitting…' : 'Submit for approval'}</Button></footer></form></section></div>}
  </>
}
