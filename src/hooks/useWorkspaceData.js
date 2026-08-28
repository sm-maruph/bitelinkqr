import { useEffect, useState } from 'react'
import { workspaceService } from '../services/workspaceService'
import { demoAdminWorkspace } from '../data/demoAdminPreview'
import { useAuth } from '../contexts/AuthContext'

export default function useWorkspaceData(context) {
  const { session } = useAuth()
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  useEffect(() => {
    let active = true
    setState({ data: null, loading: true, error: '' })
    const request = context.demoPreview ? Promise.resolve(demoAdminWorkspace) : session && context.tenantId && context.restaurantUuid && context.outletId
      ? workspaceService.getWorkspace(session, context.tenantId, context.restaurantUuid, context.outletId)
      : Promise.reject(new Error('Workspace context is not ready'))
    request
      .then((data) => { if (active) setState({ data, loading: false, error: '' }) })
      .catch(() => { if (active) setState({ data: null, loading: false, error: 'Could not load dashboard data.' }) })
    return () => { active = false }
  }, [context.restaurantId, context.outlet, context.outletId, context.restaurantUuid, context.tenantId, context.demoPreview, session])
  return state
}
