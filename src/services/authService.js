import { apiRequest } from './apiClient'

export const authService = {
  login: (credentials) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (account) => apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(account) }),
  refresh: () => apiRequest('/api/auth/refresh', { method: 'POST' }),
  logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
  me: (token) => apiRequest('/api/auth/me', { headers: { authorization: `Bearer ${token}` } }),
  changePassword: (token, input) => apiRequest('/api/auth/change-password', { method:'POST', headers:{authorization:`Bearer ${token}`}, body:JSON.stringify(input) }),
}
