import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './onboarding.css'
import './catalog-previews.css'
import './actual-preview.css'
import './mobile-preview.css'
import './iphone-preview-fit.css'
import './template-grid-fix.css'
import './template-pagination.css'
import './dark-landing.css'
import App from './App.jsx'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import MarketingHome from './pages/MarketingHome.jsx'
import { LoginPage, RegisterPage } from './pages/AuthPages.jsx'

function ProtectedAdmin(){const {session,loading}=useAuth();if(loading)return <main className="auth-page">Loading…</main>;return session?<App/>:<Navigate to="/login" replace/>}
function GuestOnly({children}){const {session,loading}=useAuth();if(loading)return <main className="auth-page">Loading…</main>;return session?<Navigate to="/admin" replace/>:children}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter><AuthProvider><Routes><Route path="/" element={<MarketingHome/>}/><Route path="/login" element={<GuestOnly><LoginPage/></GuestOnly>}/><Route path="/register" element={<GuestOnly><RegisterPage/></GuestOnly>}/><Route path="/admin/*" element={<ProtectedAdmin/>}/><Route path="/super-admin/*" element={<ProtectedAdmin/>}/><Route path="/*" element={<App/>}/></Routes></AuthProvider></BrowserRouter>
  </StrictMode>,
)
