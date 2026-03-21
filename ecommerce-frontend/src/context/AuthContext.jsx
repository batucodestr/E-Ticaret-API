import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, signup as apiSignup } from '../api/auth'
import { getApiError } from '../api/errorHelper'

const AuthContext = createContext(null)

function isValidToken(token) {
  return token && token !== 'undefined' && token !== 'null' && token.split('.').length === 3
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const access = localStorage.getItem('access_token')
      const refresh = localStorage.getItem('refresh_token')
      const stored = localStorage.getItem('user')
      if (!isValidToken(access) || !isValidToken(refresh)) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        return null
      }
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await apiLogin(email, password)
      const { token, user: userData } = res.data
      localStorage.setItem('access_token', token.access)
      localStorage.setItem('refresh_token', token.refresh)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    } catch (err) {
      return { success: false, error: getApiError(err, 'Giriş başarısız.') }
    } finally {
      setLoading(false)
    }
  }

  const register = async (data) => {
    setLoading(true)
    try {
      const res = await apiSignup(data)
      const { token, user: userData } = res.data
      localStorage.setItem('access_token', token.access)
      localStorage.setItem('refresh_token', token.refresh)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { success: true }
    } catch (err) {
      return { success: false, error: getApiError(err, 'Kayıt başarısız.') }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
