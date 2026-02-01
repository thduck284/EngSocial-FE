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
  return localStorage.getItem('authToken') ? localStorage : sessionStorage
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
