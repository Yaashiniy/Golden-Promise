import { api, csrfCookie } from './client'

export async function login({ email, password }) {
  await csrfCookie()
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export async function register({ name, email, password, password_confirmation, role }) {
  await csrfCookie()
  const { data } = await api.post('/auth/register', {
    name,
    email,
    password,
    password_confirmation,
    role,
  })
  return data
}

export async function logout() {
  await api.post('/auth/logout')
}

export async function me() {
  const { data } = await api.get('/auth/me')
  return data
}
