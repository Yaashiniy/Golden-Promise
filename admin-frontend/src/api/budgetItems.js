import { api } from './client'

export async function addBudgetItem(payload) {
  const { data } = await api.post('/budget-items', payload)
  return data
}

export async function updateBudgetItem(id, patch) {
  const { data } = await api.patch(`/budget-items/${id}`, patch)
  return data
}

export async function deleteBudgetItem(id) {
  await api.delete(`/budget-items/${id}`)
}
