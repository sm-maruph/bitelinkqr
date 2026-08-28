import { useEffect,useState } from 'react'
import { analyticsService } from '../services/analyticsService'
import { demoAdminAnalytics } from '../data/demoAdminPreview'
import { workspaceService } from '../services/workspaceService'
import { useAuth } from '../contexts/AuthContext'

export default function useRestaurantAnalytics(restaurantSlug,demoPreview=false,context={}){
  const {session}=useAuth()
  const [state,setState]=useState({data:null,loading:true,error:''})
  const isDemo=demoPreview||window.location.pathname.startsWith('/demo-admin')
  useEffect(()=>{let active=true;setState({data:null,loading:true,error:''});const request=isDemo?Promise.resolve(demoAdminAnalytics):session&&context.tenantId&&context.restaurantUuid?workspaceService.getAnalytics(session,context.tenantId,context.restaurantUuid):Promise.reject(new Error('Analytics context is not ready'));request.then(data=>{if(active)setState({data,loading:false,error:''})}).catch(()=>{if(active)setState({data:null,loading:false,error:'Could not load restaurant analytics.'})});return()=>{active=false}},[restaurantSlug,isDemo,session,context.tenantId,context.restaurantUuid])
  return state
}
