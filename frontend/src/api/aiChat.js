import { api } from './client'
 
function getAiHeaders() {
  const provider = localStorage.getItem('goldie_ai_provider') || 'default'
  const key = localStorage.getItem(`goldie_ai_key_${provider}`) || localStorage.getItem('goldie_ai_key') || ''
  const model = localStorage.getItem('goldie_ai_model') || ''
  return {
    'X-User-AI-Provider': provider,
    'X-User-AI-Key': key.trim(),
    'X-User-AI-Model': model.trim(),
  }
}

export async function sendBudgetChat({ message, history }) {
  const { data } = await api.post('/ai/budget-chat', { message, history }, {
    headers: getAiHeaders()
  })
  return data
}

export async function applyBudgetProposal({ token, amount }) {
  const { data } = await api.post('/ai/budget-chat/apply', { token, amount })
  return data
}
