import { api } from './client.js'

export const getAdminVendors = async (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.category) params.append('category', filters.category)
  if (filters.tier) params.append('tier', filters.tier)
  if (filters.area) params.append('area', filters.area)
  if (filters.page) params.append('page', filters.page)

  const { data } = await api.get(`/admin/vendors?${params.toString()}`)
  return data
}
