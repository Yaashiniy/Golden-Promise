import { api } from './client'

export async function fetchBudgetCategories() {
  const { data } = await api.get('/budget-categories')
  return data
}

export async function createBudgetCategory(payload) {
  const { data } = await api.post('/budget-categories', payload)
  return data
}

export async function updateBudgetCategory(id, patch) {
  const { data } = await api.patch(`/budget-categories/${id}`, patch)
  return data
}

export async function deleteBudgetCategory(id) {
  await api.delete(`/budget-categories/${id}`)
}
