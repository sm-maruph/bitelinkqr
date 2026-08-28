import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext=createContext(null)
let bootRefresh
const tokenExpiring=token=>{try{const payload=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));return !payload.exp||payload.exp*1000<Date.now()+30000}catch{return true}}
const refreshOnce=()=>{if(!bootRefresh)bootRefresh=authService.refresh().finally(()=>{bootRefresh=null});return bootRefresh}
export function AuthProvider({children}) {
  const protectedRoute=/^\/(admin|super-admin)(\/|$)/.test(window.location.pathname)||/^\/[^/]+\/(admin|manager|outlet-manager|order-staff|kitchen)(\/|$)/.test(window.location.pathname)
  const [session,setSession]=useState(()=>{try{return JSON.parse(sessionStorage.getItem('bitelink-session'))}catch{return null}})
  const [loading,setLoading]=useState(protectedRoute&&(!session||tokenExpiring(session.accessToken)))
  const save=(value)=>{setSession(value);if(value)sessionStorage.setItem('bitelink-session',JSON.stringify(value));else sessionStorage.removeItem('bitelink-session')}
  useEffect(()=>{const sync=event=>save(event.detail);window.addEventListener('bitelink:session',sync);return()=>window.removeEventListener('bitelink:session',sync)},[])
  useEffect(()=>{if(!protectedRoute){setLoading(false);return}if(session&&!tokenExpiring(session.accessToken)){setLoading(false);return}refreshOnce().then(save).catch(()=>save(null)).finally(()=>setLoading(false))},[protectedRoute])
  const value=useMemo(()=>({session,loading,
    login:async(input)=>{const next=await authService.login(input);save(next);return next},
    register:async(input)=>{const next=await authService.register(input);save(next);return next},
    changePassword:async(input)=>{await authService.changePassword(session.accessToken,input);save({...session,user:{...session.user,mustChangePassword:false}})},
    logout:async()=>{try{await authService.logout()}finally{save(null)}},
  }),[session,loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext)
