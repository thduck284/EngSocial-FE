import { ROUTES } from '../constants'

/**
 * Kiểm tra đăng nhập: có token trong localStorage hoặc sessionStorage.
 */
export function getAuthToken() {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
}

/**
 * Lấy refresh token (cùng nơi lưu authToken).
 */
export function getRefreshToken() {
  return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
}

/**
 * Storage đang dùng cho auth (localStorage hoặc sessionStorage).
 */
export function getAuthStorage() {
  return localStorage
}

export function isAuthenticated() {
  return !!getAuthToken()
}

/**
 * Lấy user đã lưu (localStorage hoặc sessionStorage) để sync với AuthContext.
 */
export function getStoredUser() {
  const raw = localStorage.getItem('user') || sessionStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Lấy role của user đã lưu (user | moderator | admin).
 */
export function getStoredUserRole() {
  const u = getStoredUser()
  return u?.role || 'user'
}

/**
 * Kiểm tra user đã lưu có phải moderator không.
 */
export function isModerator() {
  return getStoredUserRole() === 'moderator'
}

/**
 * Kiểm tra user đã lưu có phải admin không.
 */
export function isAdmin() {
  return getStoredUserRole() === 'admin'
}

/**
 * Sau khi đăng nhập / đăng ký xong: admin & moderator vào dashboard quản trị;
 * user thường dùng `fallbackPath` (vd. `/home` hoặc `location.state.from`).
 */
export function getPostLoginNavigatePath(fallbackPath) {
  const u = getStoredUser()
  const id = u?.id ?? u?._id
  if (id == null || id === '') return fallbackPath
  if (u?.role === 'admin') return ROUTES.MANAGE_ADMIN_OVERVIEW(id)
  if (u?.role === 'moderator') return ROUTES.MANAGE_OVERVIEW(id)
  return fallbackPath
}

export const AUTH_LOGOUT_REASON_KEY = 'authLogoutReason'

export function markSessionReplacedLogout() {
  sessionStorage.setItem(AUTH_LOGOUT_REASON_KEY, 'sessionReplaced')
}

export function consumeAuthLogoutReason() {
  const reason = sessionStorage.getItem(AUTH_LOGOUT_REASON_KEY)
  if (reason) sessionStorage.removeItem(AUTH_LOGOUT_REASON_KEY)
  return reason
}

/** Đọc sv (session version) từ JWT access token */
export function getTokenSessionVersion(token) {
  if (!token) return 0
  try {
    const part = token.split('.')[1]
    if (!part) return 0
    const padded = part.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(padded))
    return payload.sv ?? 0
  } catch {
    return 0
  }
}
