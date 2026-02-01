/**
 * Kiểm tra đăng nhập: có token trong localStorage hoặc sessionStorage.
 */
export function getAuthToken() {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
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
