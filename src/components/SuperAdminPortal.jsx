import { useEffect, useState } from 'react'
import { Activity, Bell, CircleDollarSign, Grid2X2, Plus, ShoppingBag, Store, Utensils } from 'lucide-react'
import { Button, StatCard } from './PortalChrome'
import { platformService } from '../services/platformService'
import { useAuth } from '../contexts/AuthContext'

const formatDate = () => new Intl.DateTimeFormat('en-GB', {
  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka',
}).format(new Date())

export default function SuperAdminPortal({ setRole }) {
  const {session}=useAuth()
  const [overview, setOverview] = useState(null)
  const [error, setError] = useState('')
  const [outletRequests,setOutletRequests]=useState([])

  useEffect(() => {
    let active = true
    platformService.getDemoOverview()
      .then((data) => { if (active) setOverview(data) })
      .catch(() => { if (active) setError('Could not load platform data from the backend.') })
    return () => { active = false }
  }, [])
  useEffect(()=>{if(session?.accessToken)platformService.getOutletRequests(session.accessToken).then(result=>setOutletRequests(result.items)).catch(()=>{})},[session])
  const decide=async(id,decision)=>{await platformService.decideOutlet(session.accessToken,id,decision);setOutletRequests(current=>current.filter(item=>item.id!==id))}

  const totals = overview?.totals
  const restaurants = overview?.restaurants || []

  return <div className="super-shell"><div className="super-top">
    <a className="brand" href="#super"><span className="brand-mark"><Utensils size={17} /></span><span>Bite<span>Link</span></span></a>
    <span className="super-badge">Platform control center</span>
    <div><button className="icon-button"><Bell size={18} /></button><span className="user-avatar">AD</span></div>
  </div><div className="super-content">
    <div className="super-heading"><div><span className="page-eyebrow">{formatDate()}</span><h1>Platform overview</h1><p>Live information from the BiteLink database.</p></div><Button className="primary"><Plus size={16} /> Add restaurant</Button></div>
    {error && <div className="panel" role="alert"><b>{error}</b><p>Make sure both development servers are running.</p></div>}
    <section className="stats-grid super-stats">
      <StatCard label="Restaurants" value={totals?.restaurants ?? '…'} trend="Live" meta="published restaurants" icon={Store} />
      <StatCard label="Active outlets" value={totals?.active_outlets ?? '…'} trend="Live" meta="across network" icon={Grid2X2} tone="coral" />
      <StatCard label="Orders today" value={totals?.ordersToday ?? '—'} trend="No order data yet" meta="today" icon={ShoppingBag} tone="amber" />
      <StatCard label="MRR" value={totals?.monthlyRecurringRevenue ?? '—'} trend="No subscriptions yet" meta="recurring revenue" icon={CircleDollarSign} tone="blue" />
    </section>
    {outletRequests.length>0&&<div className="panel outlet-approvals"><div className="panel-heading"><div><span className="panel-kicker">Approval queue</span><h2>New outlet requests</h2></div></div>{outletRequests.map(item=><div className="approval-row" key={item.id}><span className="restaurant-avatar">{item.name[0]}</span><div><b>{item.name}</b><small>{item.restaurant_name} · {item.tenant_name} · {item.city}</small></div><button onClick={()=>decide(item.id,'reject')}>Reject</button><button className="approve" onClick={()=>decide(item.id,'approve')}>Approve</button></div>)}</div>}
    <div className="super-grid"><div className="panel full-panel">
      <div className="panel-heading"><div><span className="panel-kicker">Database records</span><h2>Restaurants</h2></div></div>
      {!overview && !error && <div className="restaurant-row"><div><b>Loading restaurants…</b><small>Fetching from BiteLink API</small></div></div>}
      {overview && restaurants.length === 0 && <div className="restaurant-row"><div><b>No restaurants found</b><small>Add the first restaurant to get started.</small></div></div>}
      {restaurants.map((restaurant) => <div className="restaurant-row" key={restaurant.id}>
        <span className="restaurant-avatar">{restaurant.name.charAt(0).toUpperCase()}</span>
        <div><b>{restaurant.name}</b><small>{restaurant.slug} <span>•</span> {restaurant.outlets} outlet(s)</small></div>
        <span className="status green">Active</span>
      </div>)}
    </div><div className="panel platform-health">
      <div className="panel-heading"><div><span className="panel-kicker">System status</span><h2>Platform health</h2></div><span className="health-dot">Backend connected</span></div>
      {[["Database API", overview ? 'Connected' : 'Checking…'], ['Payment gateway', 'Not configured'], ['Notifications', 'Not configured']].map(([label, value]) => <div className="health-row" key={label}><Activity size={17} /><span>{label}</span><b>{value}</b><i /></div>)}
    </div></div>
    <button className="super-entry" onClick={() => setRole('owner')}>Return to restaurant portal</button>
  </div></div>
}
