import { api } from './client'

export async function fetchBudget() {
  const { data } = await api.get('/budget')
  return data
}

export async function setBudgetTotal(total_budget) {
  const { data } = await api.put('/budget', { total_budget })
  return data
}

export async function createExpense(payload) {
  const { data } = await api.post('/budget/expenses', payload)
  return data
}

export async function updateExpense(id, payload) {
  const { data } = await api.put(`/budget/expenses/${id}`, payload)
  return data
}

export async function deleteExpense(id) {
  await api.delete(`/budget/expenses/${id}`)
}
