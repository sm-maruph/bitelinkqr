import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ContextBar, AdminSidebar } from './components/PortalChrome'
import { AnalyticsPage, MenuPage, OrdersPage, Overview, PaymentsPage, TablesPage, TeamPage } from './components/AdminPages'
import TeamManagementPage from './components/TeamManagementPage'
import OrganizationSettingsPage from './components/OrganizationSettingsPage'
import QrCodesPage from './components/QrCodesPage'
import MenuManagementPage from './components/MenuManagementPage'
import SuperAdminPortal from './components/SuperAdminPortal'
import CustomerPortalPage from './pages/customer/CustomerPortalPage'
import { KitchenDashboard, OrderStaffDashboard, OutletDashboard } from './components/RoleDashboards'
import './App.css'
import './mobile-menu-grid.css'
import './tables.css'
import './analytics.css'
import './manager-overview.css'
import './workspace-loader.css'
import './staff-management.css'
import './management.css'
import './management-approval.css'
import './qr-codes.css'
import './qr-table-modal.css'
import './customer-live-loader.css'
import './template-surface-contrast.css'
import './outlet-operations.css'
import './layout-overflow-fix.css'
import './menu-loader.css'
import './role-permissions.css'
import './dark-landing-fix.css'
import './dark-template-gallery.css'
import './live-template-thumbnails.css'
import './template-redesign.css'
import { useAuth } from './contexts/AuthContext'
import { workspaceService } from './services/workspaceService'

const pages = { Overview, 'Live orders': OrdersPage, Tables: TablesPage, 'Menu & offers': MenuManagementPage, Payments: PaymentsPage, Analytics: AnalyticsPage, Team: TeamManagementPage, 'QR codes': QrCodesPage, Settings: OrganizationSettingsPage }

function DemoToast() {
  const [message, setMessage] = useState('')
  useEffect(() => {
    const show = (event) => { setMessage(event.detail); window.clearTimeout(show.timer); show.timer = window.setTimeout(() => setMessage(''), 2600) }
    window.addEventListener('bitelink:toast', show)
    return () => window.removeEventListener('bitelink:toast', show)
  }, [])
  return message ? <div className="demo-toast" role="status">âœ“ {message}</div> : null
}

function WorkspaceBootSkeleton(){return <div className="workspace-boot" role="status" aria-label="Loading restaurant workspace"><aside className="workspace-boot-sidebar"><div className="boot-brand"><i/><span/></div><div className="boot-restaurant"><i/><span><b/><small/></span></div><div className="boot-nav">{Array.from({length:8},(_,index)=><i key={index}/>)}</div><div className="boot-user"><i/><span/></div></aside><main className="workspace-boot-main"><header><div><i className="boot-line tiny"/><i className="boot-line title"/><i className="boot-line subtitle"/></div><i className="boot-action"/></header><section className="boot-stats">{Array.from({length:6},(_,index)=><article key={index}><i className="boot-square"/><i className="boot-line tiny"/><i className="boot-line amount"/><i className="boot-line subtitle"/></article>)}</section><section className="boot-panels"><article><i className="boot-line tiny"/><i className="boot-line panel-title"/><div className="boot-chart"><i/><i/><i/><i/></div></article><article className="boot-ring-panel"><i className="boot-line tiny"/><i className="boot-line panel-title"/><div className="boot-ring"/></article></section><section className="boot-outlets"><i className="boot-line tiny"/><i className="boot-line panel-title"/><div><article/><article/></div></section></main><span className="sr-only">Loading your restaurant workspace</span></div>}

export default function App() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const path = window.location.pathname
  const pathParts=path.split('/').filter(Boolean)
  const search = new URLSearchParams(window.location.search)
  const previewMode = search.get('previewMode')
  const embedded = search.get('embed') === '1'
  const portalSegment=path.split('/').filter(Boolean)[1]
  const segmentRole={admin:'owner',manager:'manager','outlet-manager':'outlet','order-staff':'order',kitchen:'kitchen'}[portalSegment]
  const initialRole = previewMode === 'customer' ? 'customer' : previewMode === 'admin' ? 'owner' : path.startsWith('/super-admin') ? 'super' : segmentRole || (path.startsWith('/admin') || path.startsWith('/demo-admin') ? 'owner' : path !== '/' ? 'customer' : 'owner')
  const isDemoPreview = previewMode === 'admin' || path.startsWith('/demo-admin')
  const showContextBar = !embedded && isDemoPreview
  const requiresAccountContext = (path.startsWith('/admin') || Boolean(segmentRole)) && !previewMode
  const isCustomerTablePath=pathParts[2]==='table'&&Boolean(pathParts[0]&&pathParts[1]&&pathParts[3])
  const [context, setContext] = useState({ roleId: initialRole, restaurantId: requiresAccountContext?'':isCustomerTablePath?pathParts[0]:'terrace', restaurantUuid:'', restaurantName: requiresAccountContext?'':'', outlet: requiresAccountContext?'':isCustomerTablePath?pathParts[1]:'Dhanmondi', outletId:'', tableNumber:isCustomerTablePath?decodeURIComponent(pathParts[3]):'12', tenantId:'', restaurants:[], permissions:[], demoPreview: isDemoPreview })
  const [contextLoading,setContextLoading]=useState(requiresAccountContext)
  const [contextError,setContextError]=useState('')
  const [activePage, setActivePage] = useState('Overview')
  const [collapsed, setCollapsed] = useState(false)
  const role = context.roleId
  const rolePath={owner:'admin',manager:'manager',outlet:'outlet-manager',order:'order-staff',kitchen:'kitchen'}
  const setRole = (roleId) => { if(roleId==='super'&&!session?.user?.isPlatformAdmin)return;setActivePage('Overview'); setContext((current) => ({ ...current, roleId })) }
  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }) }
  const Page = role === 'kitchen' ? KitchenDashboard : role === 'order' ? OrderStaffDashboard : role === 'outlet' && activePage === 'Overview' ? OutletDashboard : pages[activePage] || Overview
  useEffect(() => {
    document.body.classList.toggle('has-context-bar', showContextBar)
    return () => document.body.classList.remove('has-context-bar')
  }, [showContextBar])
  useEffect(() => {
    if(!requiresAccountContext){setContextLoading(false);return}
    const tenantId=session?.tenants?.[0]?.id
    if(!session||!tenantId){setContextLoading(false);setContextError('Your restaurant session is unavailable. Please log in again.');return}
    let active=true
    workspaceService.getContext(session,tenantId).then(data=>{
      if(!active)return
      const restaurant=data.restaurants?.[0],outlet=restaurant?.outlets?.[0]
      if(!restaurant||!outlet)throw new Error('No restaurant workspace was found')
      const roleCode=data.roles?.[0]?.code
      const roleScope=data.roles?.[0]?.scope
      const roleId=roleCode==='restaurant_manager'?'manager':roleCode==='outlet_manager'?'outlet':roleCode==='order_staff'?'order':roleCode==='kitchen_staff'?'kitchen':roleCode==='owner'?'owner':roleScope==='outlet'?'outlet':roleScope==='restaurant'?'manager':'owner'
      setContext(current=>({...current,tenantId,restaurants:data.restaurants,permissions:data.permissions||[],userDisplayName:session.user?.displayName||session.user?.email||'Account owner',restaurantId:restaurant.slug,restaurantUuid:restaurant.id,restaurantName:restaurant.name,outlet:outlet.name,outletId:outlet.id,roleId}))
      setContextError('');setContextLoading(false)
    }).catch(()=>{if(active){setContextError('Could not load your registered restaurant. Please sign in again.');setContextLoading(false)}})
    return()=>{active=false}
  },[session,requiresAccountContext])
  useEffect(()=>{if(requiresAccountContext&&!contextLoading&&!contextError&&context.restaurantId&&rolePath[context.roleId])navigate(`/${context.restaurantId}/${rolePath[context.roleId]}`,{replace:true})},[requiresAccountContext,contextLoading,contextError,context.restaurantId,context.roleId,navigate])
  useEffect(() => {
    if (!isDemoPreview) return undefined
    const handleButtonClick = (event) => {
      const button = event.target.closest('button')
      if (!button || button.disabled || button.dataset.noToast === 'true') return
      const label = button.getAttribute('aria-label') || button.textContent.trim().replace(/\s+/g, ' ')
      if (label) window.dispatchEvent(new CustomEvent('bitelink:toast', { detail: `${label} action completed in demo mode` }))
    }
    document.addEventListener('click', handleButtonClick)
    return () => document.removeEventListener('click', handleButtonClick)
  }, [isDemoPreview])
  if(contextLoading)return <WorkspaceBootSkeleton/>
  if(contextError)return <main className="auth-page"><div className="auth-error" role="alert">{contextError}</div></main>
  return <>{showContextBar&&<ContextBar context={context} setContext={setContext} onRoleChange={(event) => setRole(event.target.value)} />}{role === 'customer' ? <CustomerPortalPage setRole={setRole} context={context} embedded={embedded} /> : role === 'super' ? <SuperAdminPortal setRole={setRole} /> : <div className={`portal-shell ${embedded?'embedded-admin':''}`}><AdminSidebar activePage={activePage} setActivePage={setActivePage} collapsed={collapsed} setCollapsed={setCollapsed} context={context} setContext={setContext} onLogout={handleLogout} /><main className="portal-main"><Page setActivePage={setActivePage} context={context} />{!embedded&&session?.user?.isPlatformAdmin&&<button className="super-entry" onClick={() => setRole('super')}>Platform control center</button>}</main></div>}{!embedded&&<DemoToast />}</>
}
