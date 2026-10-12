import { api } from './client'

export async function fetchFavorites() {
  const { data } = await api.get('/favorites')
  return data
}

export async function toggleFavorite(type, id) {
  const { data } = await api.post('/favorites/toggle', { type, id })
  return data
}
