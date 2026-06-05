import { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredUser, getAuthToken, getRefreshToken, getAuthStorage } from '../utils/auth'
import {
  GUEST_USER,
  isGuestSession,
  setGuestSession,
  clearGuestSession,
} from '../utils/guestAuth'
import { authService } from '../services'
import { ROUTES } from '../constants'

const REFRESH_INTERVAL_MS = 10 * 60 * 1000

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [guestFlag, setGuestFlag] = useState(() => isGuestSession() && !getAuthToken())
  const refreshIntervalRef = useRef(null)

  useEffect(() => {
    const sToken = sessionStorage.getItem('authToken')
    const lToken = localStorage.getItem('authToken')
    if (sToken && !lToken) {
      ;['authToken', 'refreshToken', 'user', 'rememberedEmail', 'rememberedPassword'].forEach((key) => {
        const val = sessionStorage.getItem(key)
        if (val) localStorage.setItem(key, val)
      })
    }

    if (getAuthToken() && getStoredUser()) {
      clearGuestSession()
      setGuestFlag(false)
      setUser(getStoredUser())
      return
    }

    if (isGuestSession()) {
      setGuestFlag(true)
      setUser(GUEST_USER)
    }
  }, [])

  useEffect(() => {
    if (!getAuthToken() || !getRefreshToken() || guestFlag) return

    const refresh = async () => {
      const refreshToken = getRefreshToken()
      if (!refreshToken) return
      try {
        const res = await authService.refreshToken(refreshToken)
        if (res?.success && res?.data) {
          const storage = getAuthStorage()
          if (res.data.accessToken) storage.setItem('authToken', res.data.accessToken)
          if (res.data.refreshToken) storage.setItem('refreshToken', res.data.refreshToken)
          if (res.data.user) {
            storage.setItem('user', JSON.stringify(res.data.user))
            setUser(res.data.user)
          }
        }
      } catch {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
          refreshIntervalRef.current = null
        }
      }
    }

    refreshIntervalRef.current = setInterval(refresh, REFRESH_INTERVAL_MS)
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
    }
  }, [user?.id, guestFlag])

  const value = useMemo(() => {
    const hasToken = !!getAuthToken()
    const guestActive = !hasToken && (guestFlag || isGuestSession())
    const isGuest = guestActive
    const isAuthenticated = hasToken
    const canAccessApp = hasToken || guestActive
    const currentUser = isGuest ? GUEST_USER : (user ?? getStoredUser())

    const setAuth = (data) => {
      clearGuestSession()
      setGuestFlag(false)
      if (data?.user) {
        setUser(data.user)
        const storage = getAuthStorage()
        storage.setItem('user', JSON.stringify(data.user))
      } else {
        setUser(getStoredUser())
      }
    }

    const loginAsGuest = () => {
      ;['authToken', 'refreshToken'].forEach((key) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })
      setGuestSession()
      setGuestFlag(true)
      setUser(GUEST_USER)
      navigate(ROUTES.LESSON, { replace: true })
    }

    const logout = () => {
      ;['authToken', 'refreshToken', 'user'].forEach((key) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })
      clearGuestSession()
      setGuestFlag(false)
      setUser(null)
      navigate(ROUTES.LOGIN, { replace: true })
    }

    const role = currentUser?.role || 'user'

    return {
      user: currentUser,
      role,
      isAuthenticated,
      isGuest,
      canAccessApp,
      isModerator: !isGuest && role === 'moderator',
      isAdmin: !isGuest && role === 'admin',
      setAuth,
      loginAsGuest,
      logout,
    }
  }, [user, guestFlag, navigate])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
