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
