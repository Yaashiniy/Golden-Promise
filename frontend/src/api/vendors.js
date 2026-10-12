import { api } from './client'

export async function fetchVendorCategories() {
  const { data } = await api.get('/vendor-categories')
  return data
}

export async function fetchVendors(params = {}) {
  const { data } = await api.get('/vendors', { params })
  return data
}

export async function fetchVendor(slug) {
  const { data } = await api.get(`/vendors/${slug}`)
  return data
}

export async function fetchVendorFilters() {
  const { data } = await api.get('/vendors/filters')
  return data
}
