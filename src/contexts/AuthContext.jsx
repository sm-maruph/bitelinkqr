import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext=createContext(null)
export function AuthProvider({children}) {
  const protectedRoute=/^\/(admin|super-admin)(\/|$)/.test(window.location.pathname)
  const [session,setSession]=useState(()=>{try{return JSON.parse(sessionStorage.getItem('bitelink-session'))}catch{return null}})
  const [loading,setLoading]=useState(protectedRoute&&!session)
  const save=(value)=>{setSession(value);if(value)sessionStorage.setItem('bitelink-session',JSON.stringify(value));else sessionStorage.removeItem('bitelink-session')}
  useEffect(()=>{if(!protectedRoute){setLoading(false);return}if(session){setLoading(false);return}authService.refresh().then(save).catch(()=>save(null)).finally(()=>setLoading(false))},[protectedRoute,session])
  const value=useMemo(()=>({session,loading,
    login:async(input)=>{const next=await authService.login(input);save(next);return next},
    register:async(input)=>{const next=await authService.register(input);save(next);return next},
    logout:async()=>{try{await authService.logout()}finally{save(null)}},
  }),[session,loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext)
