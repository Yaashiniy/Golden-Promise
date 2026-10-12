import axios from 'axios'
import toast from 'react-hot-toast'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Show toast if request takes a while (Aiven DB waking up)
  config.metadata = { startTime: new Date() }
  config.timeoutTimer = setTimeout(() => {
    toast('Waking up the cloud database... this only happens on the first load!', { id: 'db-wakeup', icon: '☁️', duration: 4000 })
  }, 2500)
  
  return config
})

let unauthorizedHandler = null

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn
}

api.interceptors.response.use(
  (response) => {
    clearTimeout(response.config.timeoutTimer)
    return response
  },
  (error) => {
    if (error.config && error.config.timeoutTimer) {
      clearTimeout(error.config.timeoutTimer)
    }
    if (error.response?.status === 401 && unauthorizedHandler) {
      unauthorizedHandler()
    }
    return Promise.reject(error)
  },
)

export async function csrfCookie() {
  try {
    await axios.get('/sanctum/csrf-cookie', { withCredentials: true })
  } catch {
    // Fallback gracefully
  }
}
