/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || null)
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('auth_user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) localStorage.setItem('auth_token', token)
    else localStorage.removeItem('auth_token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user))
    else localStorage.removeItem('auth_user')
  }, [user])

  const refreshMe = async () => {
    if (!token) return null
    try {
      const { data } = await api.get('/me')
      setUser(data)
      return data
    } catch {
      return null
    }
  }

  useEffect(() => { if (token && !user) { refreshMe() } }, [token])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/login', { email, password })
      setToken(data.token)
      setUser(data.user)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e?.response?.data?.message || 'Error de login' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    setLoading(true)
    try {
      const { data } = await api.post('/register', payload)
      setToken(data.token)
      setUser(data.user)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e?.response?.data?.message || 'Error de registro' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try { await api.post('/logout') } catch { /* ignora error de red en logout */ }
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ token, user, loading, login, register, logout, setUser, refreshMe }), [token, user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
