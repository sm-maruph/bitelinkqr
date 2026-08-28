import { useEffect,useState } from 'react'
import { analyticsService } from '../services/analyticsService'
import { demoAdminAnalytics } from '../data/demoAdminPreview'

export default function useRestaurantAnalytics(restaurantSlug,demoPreview=false){
  const [state,setState]=useState({data:null,loading:true,error:''})
  const isDemo=demoPreview||window.location.pathname.startsWith('/demo-admin')
  useEffect(()=>{let active=true;const request=isDemo?Promise.resolve(demoAdminAnalytics):analyticsService.getRestaurantAnalytics(restaurantSlug);request.then(data=>{if(active)setState({data,loading:false,error:''})}).catch(()=>{if(active)setState({data:null,loading:false,error:'Could not load restaurant analytics.'})});return()=>{active=false}},[restaurantSlug,isDemo])
  return state
}
