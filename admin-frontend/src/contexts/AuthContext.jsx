import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { setUnauthorizedHandler } from '../api/client'
import * as authApi from '../api/auth'
import LogoutModal from '../components/LogoutModal.jsx'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const u = await authApi.me()
      setUser(u)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    setUnauthorizedHandler(() => {
      localStorage.removeItem('admin_auth_token')
      setUser(null)
    })
  }, [refresh])

  const login = useCallback(async (credentials) => {
    const result = await authApi.login(credentials)
    if (result.token) {
      localStorage.setItem('admin_auth_token', result.token)
    }
    setUser(result.user ?? result)
    return result
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      localStorage.removeItem('admin_auth_token')
      setUser(null)
      setShowLogoutModal(true)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
      {showLogoutModal && <LogoutModal onClose={() => setShowLogoutModal(false)} />}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
