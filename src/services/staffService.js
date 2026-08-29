import { apiRequest, authenticatedHeaders } from './apiClient'

const options=(session,tenantId)=>({headers:authenticatedHeaders({accessToken:session.accessToken,tenantId})})
export const staffService={
  getRoles:(session,tenantId)=>apiRequest('/api/v1/roles',options(session,tenantId)),
  create:(session,tenantId,payload)=>apiRequest('/api/v1/staff-members',{...options(session,tenantId),method:'POST',body:JSON.stringify(payload)}),
  createRole:(session,tenantId,payload)=>apiRequest('/api/v1/roles',{...options(session,tenantId),method:'POST',body:JSON.stringify(payload)}),
  updateRole:(session,tenantId,id,payload)=>apiRequest(`/api/v1/roles/${id}`,{...options(session,tenantId),method:'PATCH',body:JSON.stringify(payload)}),
  assignRole:(session,tenantId,payload)=>apiRequest('/api/v1/role-assignments',{...options(session,tenantId),method:'POST',body:JSON.stringify(payload)}),
  removeRole:(session,tenantId,payload)=>apiRequest('/api/v1/role-assignments',{...options(session,tenantId),method:'DELETE',body:JSON.stringify(payload)}),
}
