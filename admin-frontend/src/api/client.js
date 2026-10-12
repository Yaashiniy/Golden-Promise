import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: false // Crucial for token-based admin auth
})

// Attach token dynamically to each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function setUnauthorizedHandler(handler) {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        handler()
      }
      return Promise.reject(error)
    }
  )
}

export async function csrfCookie() {
  try {
    await axios.get('/sanctum/csrf-cookie', { withCredentials: true })
  } catch {
    // Fallback gracefully
  }
}
