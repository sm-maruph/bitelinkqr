import { useEffect,useState } from 'react'
import { analyticsService } from '../services/analyticsService'
import { demoAdminAnalytics } from '../data/demoAdminPreview'
import { workspaceService } from '../services/workspaceService'
import { useAuth } from '../contexts/AuthContext'

export default function useRestaurantAnalytics(restaurantSlug,demoPreview=false,context={}){
  const {session}=useAuth()
  const [state,setState]=useState({data:null,loading:true,error:''})
  const isDemo=demoPreview||window.location.pathname.startsWith('/demo-admin')||new URLSearchParams(window.location.search).get('previewMode')==='admin'
  useEffect(()=>{let active=true;setState({data:null,loading:true,error:''});const tenantId=context.tenantId||session?.tenants?.[0]?.id;const request=isDemo?Promise.resolve(demoAdminAnalytics):session&&tenantId?(context.restaurantUuid?workspaceService.getAnalytics(session,tenantId,context.restaurantUuid):workspaceService.getContext(session,tenantId).then(data=>{const restaurant=data.restaurants?.find(item=>item.slug===restaurantSlug)||data.restaurants?.[0];if(!restaurant)throw new Error('Restaurant not found');return workspaceService.getAnalytics(session,tenantId,restaurant.id)})):Promise.reject(new Error('Analytics context is not ready'));request.then(data=>{if(active)setState({data,loading:false,error:''})}).catch(()=>{if(active)setState({data:null,loading:false,error:'Could not load restaurant analytics.'})});return()=>{active=false}},[restaurantSlug,isDemo,session,context.tenantId,context.restaurantUuid])
  return state
}
