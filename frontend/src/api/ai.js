import { api } from './client'
 
function getAiHeaders() {
  const provider = localStorage.getItem('goldie_ai_provider') || 'gemini'
  const key = localStorage.getItem(`goldie_ai_key_${provider}`) || localStorage.getItem('goldie_ai_key') || ''
  return {
    'X-User-AI-Provider': provider,
    'X-User-AI-Key': key.trim(),
  }
}

export async function generateBudgetPlan(payload) {
  const { data } = await api.post('/ai/budget-plan', payload, {
    headers: getAiHeaders()
  })
  return data
}
 
// NEW — smart generators by culture
export async function generateChecklist(payload = {}) {
  const { data } = await api.post('/ai/generate-checklist', payload, {
    headers: getAiHeaders()
  })
  return data
}
 
export async function generateBudgetCategories(payload) {
  const { data } = await api.post('/ai/generate-budget', payload, {
    headers: getAiHeaders()
  })
  return data
}
