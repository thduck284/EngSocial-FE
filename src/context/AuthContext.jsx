import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredUser, getAuthToken } from '../utils/auth'
import { ROUTES } from '../constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  // Đồng bộ state với storage khi mount (sau refresh hoặc mở tab mới)
  useEffect(() => {
    if (getAuthToken() && getStoredUser()) {
      setUser(getStoredUser())
    }
  }, [])

  const value = useMemo(() => {
    const isAuthenticated = !!getAuthToken()
    const currentUser = user ?? getStoredUser()

    const setAuth = (data) => {
      if (data?.user) setUser(data.user)
      else setUser(getStoredUser())
    }

    const logout = () => {
      ;['authToken', 'refreshToken', 'user'].forEach((key) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })
      setUser(null)
      navigate(ROUTES.LOGIN, { replace: true })
    }

    return {
      user: currentUser,
      isAuthenticated,
      setAuth,
      logout,
    }
  }, [user, navigate])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
