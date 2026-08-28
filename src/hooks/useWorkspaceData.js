import { useEffect, useState } from 'react'
import { workspaceService } from '../services/workspaceService'
import { demoAdminWorkspace } from '../data/demoAdminPreview'

export default function useWorkspaceData(context) {
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  useEffect(() => {
    let active = true
    setState({ data: null, loading: true, error: '' })
    const request = context.demoPreview ? Promise.resolve(demoAdminWorkspace) : workspaceService.getDemoWorkspace(context.restaurantId, context.outlet)
    request
      .then((data) => { if (active) setState({ data, loading: false, error: '' }) })
      .catch(() => { if (active) setState({ data: null, loading: false, error: 'Could not load dashboard data.' }) })
    return () => { active = false }
  }, [context.restaurantId, context.outlet, context.demoPreview])
  return state
}
