import { api } from './client'

export async function fetchVenues(params = {}) {
  const { data } = await api.get('/venues', { params })
  return data
}

export async function fetchVenue(slug) {
  const { data } = await api.get(`/venues/${slug}`)
  return data
}

export async function fetchAreas() {
  const { data } = await api.get('/venues/areas')
  return data
}

export async function fetchVenueFilters() {
  const { data } = await api.get('/venues/filters')
  return data
}
