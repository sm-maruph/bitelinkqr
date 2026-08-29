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
    const refreshTimer = context.demoPreview ? null : window.setInterval(refreshWhenVisible, 3000)
    window.addEventListener('focus', refreshWhenVisible)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      active = false
      if (refreshTimer) window.clearInterval(refreshTimer)
      window.removeEventListener('focus', refreshWhenVisible)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [context.restaurantId, context.outlet, context.outletId, context.restaurantUuid, context.tenantId, context.demoPreview, session])
  return state
}
