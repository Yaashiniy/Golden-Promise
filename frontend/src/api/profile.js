import { api } from './client'

export async function updateProfile(payload) {
  const { data } = await api.patch('/profile', payload)
  return data
}

export async function uploadProfilePhoto(file) {
  const fd = new FormData()
  fd.append('photo', file)
  const { data } = await api.post('/profile/photo', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteAccount(password) {
  const { data } = await api.delete('/profile', { data: { password } })
  return data
}
