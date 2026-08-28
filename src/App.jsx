import { useEffect, useState } from 'react'
import { ContextBar, AdminSidebar } from './components/PortalChrome'
import { AnalyticsPage, MenuPage, OrdersPage, Overview, PaymentsPage, TablesPage, TeamPage } from './components/AdminPages'
import SuperAdminPortal from './components/SuperAdminPortal'
import CustomerPortalPage from './pages/customer/CustomerPortalPage'
import { KitchenDashboard, OrderStaffDashboard, OutletDashboard } from './components/RoleDashboards'
import './App.css'
import './mobile-menu-grid.css'
import './tables.css'
import './analytics.css'
import './manager-overview.css'
import './dark-landing-fix.css'
import './dark-template-gallery.css'
import './live-template-thumbnails.css'
import './template-redesign.css'

const pages = { Overview, 'Live orders': OrdersPage, Tables: TablesPage, 'Menu & offers': MenuPage, Payments: PaymentsPage, Analytics: AnalyticsPage, Team: TeamPage }

function DemoToast() {
  const [message, setMessage] = useState('')
  useEffect(() => {
    const show = (event) => { setMessage(event.detail); window.clearTimeout(show.timer); show.timer = window.setTimeout(() => setMessage(''), 2600) }
    window.addEventListener('bitelink:toast', show)
    return () => window.removeEventListener('bitelink:toast', show)
  }, [])
  return message ? <div className="demo-toast" role="status">âœ“ {message}</div> : null
}

export default function App() {
  const path = window.location.pathname
  const embedded = new URLSearchParams(window.location.search).get('embed') === '1'
  const initialRole = path.startsWith('/super-admin') ? 'super' : path.startsWith('/admin') || path.startsWith('/demo-admin') ? 'owner' : path !== '/' ? 'customer' : 'owner'
  const [context, setContext] = useState({ roleId: initialRole, restaurantId: 'terrace', restaurantName: 'The Terrace', outlet: 'Dhanmondi', demoPreview: path.startsWith('/demo-admin') })
  const [activePage, setActivePage] = useState('Overview')
  const [collapsed, setCollapsed] = useState(false)
  const role = context.roleId
  const setRole = (roleId) => { setActivePage('Overview'); setContext((current) => ({ ...current, roleId })) }
  const Page = role === 'kitchen' ? KitchenDashboard : role === 'order' ? OrderStaffDashboard : role === 'outlet' ? OutletDashboard : pages[activePage] || Overview
  useEffect(() => {
    const handleButtonClick = (event) => {
      const button = event.target.closest('button')
      if (!button || button.disabled || button.dataset.noToast === 'true') return
      const label = button.getAttribute('aria-label') || button.textContent.trim().replace(/\s+/g, ' ')
      if (label) window.dispatchEvent(new CustomEvent('bitelink:toast', { detail: `${label} action completed in demo mode` }))
    }
    document.addEventListener('click', handleButtonClick)
    return () => document.removeEventListener('click', handleButtonClick)
  }, [])
  return <>{!embedded&&<ContextBar context={context} setContext={setContext} onRoleChange={(event) => setRole(event.target.value)} />}{role === 'customer' ? <CustomerPortalPage setRole={setRole} context={context} embedded={embedded} /> : role === 'super' ? <SuperAdminPortal setRole={setRole} /> : <div className={`portal-shell ${embedded?'embedded-admin':''}`}><AdminSidebar activePage={activePage} setActivePage={setActivePage} collapsed={collapsed} setCollapsed={setCollapsed} context={context} setContext={setContext} /><main className="portal-main"><Page setActivePage={setActivePage} context={context} />{!embedded&&<button className="super-entry" onClick={() => setRole('super')}>Platform control center</button>}</main></div>}{!embedded&&<DemoToast />}</>
}
