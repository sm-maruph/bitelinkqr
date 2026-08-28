import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './onboarding.css'
import './catalog-previews.css'
import './actual-preview.css'
import './mobile-preview.css'
import './iphone-preview-fit.css'
import './trial-setup.css'
import './template-grid-fix.css'
import './template-pagination.css'
import './dark-landing.css'
import App from './App.jsx'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import MarketingHome from './pages/MarketingHome.jsx'
import { LoginPage, RegisterPage } from './pages/AuthPages.jsx'
import PasswordChangeGate from './components/PasswordChangeGate.jsx'

function ProtectedAdmin(){const {session,loading}=useAuth();if(loading)return <main className="auth-page">Loading…</main>;return session?<PasswordChangeGate><App/></PasswordChangeGate>:<Navigate to="/login" replace/>}
function GuestOnly({children}){const {session,loading}=useAuth();if(loading)return <main className="auth-page">Loading…</main>;return session?<Navigate to="/admin" replace/>:children}

function LandingRoute(){return new URLSearchParams(window.location.search).has('previewMode')?<App/>:<MarketingHome/>}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter><AuthProvider><Routes><Route path="/" element={<LandingRoute/>}/><Route path="/login" element={<GuestOnly><LoginPage/></GuestOnly>}/><Route path="/register" element={<GuestOnly><RegisterPage/></GuestOnly>}/><Route path="/admin/*" element={<ProtectedAdmin/>}/><Route path="/super-admin/*" element={<ProtectedAdmin/>}/>{['admin','manager','outlet-manager','order-staff','kitchen'].map(portal=><Route key={portal} path={`/:restaurantSlug/${portal}/*`} element={<ProtectedAdmin/>}/>) }<Route path="/*" element={<App/>}/></Routes></AuthProvider></BrowserRouter>
  </StrictMode>,
)
