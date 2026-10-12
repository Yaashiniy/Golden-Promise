import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { setUnauthorizedHandler } from '../api/client'
import * as authApi from '../api/auth'
import * as profileApi from '../api/profile'
import LogoutModal from '../components/LogoutModal.jsx'
import { useQueryClient } from '@tanstack/react-query'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const qc = useQueryClient()

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
      localStorage.removeItem('auth_token')
      setUser(null)
    })
  }, [refresh])

  const login = useCallback(async (credentials) => {
    const result = await authApi.login(credentials)
    if (result.token) {
      localStorage.setItem('auth_token', result.token)
    }
    qc.clear()
    setUser(result.user ?? result)
    return result
  }, [qc])

  const register = useCallback(async (form) => {
    const result = await authApi.register(form)
    if (result.token) {
      localStorage.setItem('auth_token', result.token)
    }
    setUser(result.user ?? result)
    return result
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      localStorage.removeItem('auth_token')
      setUser(null)
      qc.clear()
      setShowLogoutModal(true)
    }
  }, [qc])

  const deleteAccount = useCallback(async (password) => {
    await profileApi.deleteAccount(password)
    localStorage.removeItem('auth_token')
    setUser(null)
    qc.clear()
  }, [qc])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, deleteAccount, refresh }}>
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
