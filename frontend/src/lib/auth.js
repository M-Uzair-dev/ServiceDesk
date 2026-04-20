'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiFetch, setTokens, clearTokens, getStoredRefreshToken, getStoredUser, persistUser } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const rt = getStoredRefreshToken()
    const storedUser = getStoredUser()

    if (rt && storedUser) {
      fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      })
        .then(r => r.json())
        .then(json => {
          const payload = json.data ?? json
          if (payload.accessToken) {
            setTokens(payload.accessToken, payload.refreshToken)
            setUser(storedUser)
          } else {
            clearTokens()
          }
        })
        .catch(() => clearTokens())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (role, email, password) => {
    const data = await apiFetch(`/auth/${role}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const payload = data.accessToken ? data : (data.data ?? data)
    setTokens(payload.accessToken, payload.refreshToken)
    setUser(payload.user)
    persistUser(payload.user)
    return payload.user
  }, [])

  const logout = useCallback(async () => {
    try { await apiFetch('/auth/logout', { method: 'POST' }) } catch {}
    clearTokens()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
