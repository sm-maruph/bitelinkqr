const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export async function apiRequest(path, options = {}) {
  const headers = { ...options.headers }
  if (options.body != null && !Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')) {
    headers['content-type'] = 'application/json'
  }
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })
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
