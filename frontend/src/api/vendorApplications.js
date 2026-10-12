import { api } from './client'

export async function submitApplication(formData) {
  const { data } = await api.post('/vendor-applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const checkApplicationStatus = async (credentials) => {
  const { data } = await api.post('/vendor-applications/status', credentials)
  return data
}

export const resubmitApplication = async (applicationId, formData) => {
  const { data } = await api.post(`/vendor-applications/${applicationId}/resubmit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

// ADMIN
export async function fetchApplications(params = {}) {
  const { data } = await api.get('/admin/vendor-applications', { params })
  return data
}

export async function fetchApplication(id) {
  const { data } = await api.get(`/admin/vendor-applications/${id}`)
  return data
}

export async function approveApplication(id, payload = {}) {
  const { data } = await api.post(`/admin/vendor-applications/${id}/approve`, payload)
  return data
}

export async function rejectApplication(id, reason) {
  const { data } = await api.post(`/admin/vendor-applications/${id}/reject`, { rejection_reason: reason })
  return data
}
