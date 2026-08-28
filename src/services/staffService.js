import { apiRequest, authenticatedHeaders } from './apiClient'

const options=(session,tenantId)=>({headers:authenticatedHeaders({accessToken:session.accessToken,tenantId})})
export const staffService={
  getRoles:(session,tenantId)=>apiRequest('/api/v1/roles',options(session,tenantId)),
  create:(session,tenantId,payload)=>apiRequest('/api/v1/staff-members',{...options(session,tenantId),method:'POST',body:JSON.stringify(payload)}),
}
