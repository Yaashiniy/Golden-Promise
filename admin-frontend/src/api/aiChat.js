import { api } from './client'
 
function getAiHeaders() {
  const provider = localStorage.getItem('goldie_ai_provider') || 'gemini'
  const key = localStorage.getItem('goldie_ai_key') || ''
  return {
    'X-User-AI-Provider': provider,
    'X-User-AI-Key': key.trim(),
  }
}

export async function sendBudgetChat({ message, history }) {
  const { data } = await api.post('/ai/budget-chat', { message, history }, {
    headers: getAiHeaders()
  })
  return data
}
