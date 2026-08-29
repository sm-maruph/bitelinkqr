const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
let sessionRefresh=null
const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds))

async function refreshSession(){
  if(!sessionRefresh)sessionRefresh=fetch(`${baseUrl}/api/auth/refresh`,{method:'POST',credentials:'include'}).then(async response=>{
    if(!response.ok)throw new Error('session_refresh_failed')
    const next=await response.json()
    sessionStorage.setItem('bitelink-session',JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('bitelink:session',{detail:next}))
    return next
  }).catch(error=>{sessionStorage.removeItem('bitelink-session');window.dispatchEvent(new CustomEvent('bitelink:session',{detail:null}));throw error}).finally(()=>{sessionRefresh=null})
  return sessionRefresh
}

async function fetchWithTransientRetry(url,init){
  let response
  for(let attempt=0;attempt<3;attempt+=1){
    try{response=await fetch(url,init);if(![502,503,504].includes(response.status))return response}catch(error){if(attempt===2)throw error}
    if(attempt<2)await wait(600*(attempt+1))
  }
  return response
}

export async function apiRequest(path, options = {}) {
  const headers = { ...options.headers }
  if (options.body != null && !(options.body instanceof FormData) && !Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')) {
    headers['content-type'] = 'application/json'
  }
  const requestOptions = {
    credentials: 'include',
    ...options,
    headers,
  }
  let response = await fetchWithTransientRetry(`${baseUrl}${path}`, requestOptions)
  if(response.status===401&&!path.startsWith('/api/auth/')){
    const next=await refreshSession()
    requestOptions.headers={...headers,authorization:`Bearer ${next.accessToken}`}
    response=await fetchWithTransientRetry(`${baseUrl}${path}`,requestOptions)
  }
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(payload?.error || `API request failed (${response.status})`)
    error.status = response.status
    error.payload = payload
    throw error
  }
  return payload
}

export function authenticatedHeaders({ accessToken, tenantId }) {
  return { authorization: `Bearer ${accessToken}`, 'x-tenant-id': tenantId }
}
