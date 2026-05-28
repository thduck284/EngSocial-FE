import { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredUser, getAuthToken, getRefreshToken, getAuthStorage } from '../utils/auth'
import { authService } from '../services'
import { ROUTES } from '../constants'

const REFRESH_INTERVAL_MS = 10 * 60 * 1000 

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const refreshIntervalRef = useRef(null)

  // Đồng bộ state với storage khi mount (sau refresh hoặc mở tab mới)
  useEffect(() => {
    // Migration: Nếu có token ở sessionStorage nhưng chưa có ở localStorage (do logic cũ),
    // ta chuyển sang localStorage để hỗ trợ mở tab mới.
    const sToken = sessionStorage.getItem('authToken')
    const lToken = localStorage.getItem('authToken')
    if (sToken && !lToken) {
      ;['authToken', 'refreshToken', 'user', 'rememberedEmail', 'rememberedPassword'].forEach((key) => {
        const val = sessionStorage.getItem(key)
        if (val) localStorage.setItem(key, val)
      })
    }

    if (getAuthToken() && getStoredUser()) {
      setUser(getStoredUser())
    }
  }, [])

  // Gia hạn access token mỗi 10 phút khi đã đăng nhập
  useEffect(() => {
    if (!getAuthToken() || !getRefreshToken()) return

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
        // Refresh thất bại (token hết hạn) → clear interval, user sẽ bị 401 khi gọi API tiếp
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
  }, [user?.id])

  const value = useMemo(() => {
    const isAuthenticated = !!getAuthToken()
    const currentUser = user ?? getStoredUser()
    const role = currentUser?.role || 'user'

    const setAuth = (data) => {
      if (data?.user) {
        setUser(data.user)
        // Sync to storage so user data persists after page refresh
        const storage = getAuthStorage()
        storage.setItem('user', JSON.stringify(data.user))
      } else {
        setUser(getStoredUser())
      }
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
      role,
      isAuthenticated,
      isModerator: role === 'moderator',
      isAdmin: role === 'admin',
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
