import { useEffect, useState } from 'react'
import { workspaceService } from '../services/workspaceService'
import { demoAdminWorkspace } from '../data/demoAdminPreview'
import { useAuth } from '../contexts/AuthContext'

export default function useWorkspaceData(context) {
  const { session } = useAuth()
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  useEffect(() => {
    let active = true
    let refreshing = false
    setState({ data: null, loading: true, error: '' })
    const load = async () => {
      if (refreshing) return
      refreshing = true
      try {
        const data = context.demoPreview
          ? demoAdminWorkspace
          : session && context.tenantId && context.restaurantUuid && context.outletId
            ? await workspaceService.getWorkspace(session, context.tenantId, context.restaurantUuid, context.outletId)
            : await Promise.reject(new Error('Workspace context is not ready'))
        if (active) setState({ data, loading: false, error: '' })
      } catch {
        if (active) setState((current) => current.data
          ? current
          : { data: null, loading: false, error: 'Could not load dashboard data.' })
      } finally {
        refreshing = false
      }
    }
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') load()
    }
    load()
    let socket
    let reconnectTimer,reconnectAttempts=0
    const connectRealtime=()=>{
      if(context.demoPreview||!session?.accessToken||!active)return
      const configured=(import.meta.env.VITE_API_URL||window.location.origin).replace(/\/$/,'')
      const url=`${configured.replace(/^http/,'ws')}/api/realtime`
      socket=new WebSocket(url)
      socket.addEventListener('open',()=>socket.send(JSON.stringify({accessToken:session.accessToken,tenantId:context.tenantId,restaurantId:context.restaurantUuid,outletId:context.outletId})))
      socket.addEventListener('message',event=>{try{const message=JSON.parse(event.data);if(message.type==='ready')reconnectAttempts=0;else refreshWhenVisible()}catch{/* Ignore malformed server events. */}})
      socket.addEventListener('close',()=>{if(active){reconnectAttempts+=1;reconnectTimer=window.setTimeout(connectRealtime,Math.min(60000,3000*(2**Math.min(reconnectAttempts-1,5))))}})
    }
    connectRealtime()
    const refreshTimer = context.demoPreview ? null : window.setInterval(refreshWhenVisible, 30000)
    window.addEventListener('focus', refreshWhenVisible)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      active = false
      if (refreshTimer) window.clearInterval(refreshTimer)
      if(reconnectTimer)window.clearTimeout(reconnectTimer)
      if(socket)socket.close()
      window.removeEventListener('focus', refreshWhenVisible)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [context.restaurantId, context.outlet, context.outletId, context.restaurantUuid, context.tenantId, context.demoPreview, session])
  return state
}
