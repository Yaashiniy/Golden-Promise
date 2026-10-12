import { api } from './client'

export async function fetchChecklist() {
  const { data } = await api.get('/checklist')
  return data
}

export async function createTask(payload) {
  const body = typeof payload === 'string' ? { title: payload } : payload
  const { data } = await api.post('/checklist', body)
  return data
}

export async function updateTask(id, patch) {
  const { data } = await api.patch(`/checklist/${id}`, patch)
  return data
}

export async function deleteTask(id) {
  await api.delete(`/checklist/${id}`)
}
