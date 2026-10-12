import { api } from './client'

export async function login(credentials) {
  const { data } = await api.post('/admin-auth/login', credentials)
  return data
}

export async function logout() {
  const { data } = await api.post('/admin-auth/logout')
  return data
}

export async function me() {
  const { data } = await api.get('/admin-auth/me')
  return data
}
