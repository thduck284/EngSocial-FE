import { buildApiUrl, ROUTES } from '../constants'

/** Xóa auth storage và chuyển về trang đăng nhập (khi không token hoặc token hết hạn) */
function clearAuthAndRedirectToLogin() {
  ;['authToken', 'refreshToken', 'user'].forEach((key) => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })
  window.location.href = ROUTES.LOGIN
}

/**
 * API Helper - Wrapper cho fetch API
 */
const getStoredLanguage = () => {
  const saved = localStorage.getItem('language') || sessionStorage.getItem('language')
  return saved === 'vi' || saved === 'en' ? saved : 'vi'
}

class ApiClient {
  constructor() {
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  /**
   * Get auth token (localStorage khi "ghi nhớ", sessionStorage khi không)
   */
  getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  }

  /**
   * Get current language (same as i18n: vi/en, default vi)
   */
  getLanguage() {
    return getStoredLanguage()
  }

  /**
   * Get headers with auth token and language
   */
  getHeaders(customHeaders = {}) {
    const token = this.getAuthToken()
    const language = this.getLanguage()
    return {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      'Accept-Language': language,
      ...customHeaders,
    }
  }

  /**
   * Generic request handler
   */
  async request(endpoint, options = {}) {
    const url = buildApiUrl(endpoint)
    const headers = this.getHeaders(options.headers)
    if (options.body instanceof FormData) delete headers['Content-Type']
    const config = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type')
      const data = contentType?.includes('application/json')
        ? await response.json()
        : await response.text()

      if (!response.ok) {
        // 401 từ login/register = sai email/mật khẩu → throw để form hiển thị lỗi, không redirect
        const isAuthForm = endpoint.includes('/auth/login') || endpoint.includes('/auth/register')
        if (response.status === 401 && !isAuthForm) {
          clearAuthAndRedirectToLogin()
          return
        }
        const err = {
          status: response.status,
          message: (typeof data === 'object' && data?.message) || 'Request failed',
          data,
        }
        if (response.status === 401 && isAuthForm) err.skipAuthRedirect = true
        throw err
      }

      return data
    } catch (error) {
      if (error?.status === 401 && !error?.skipAuthRedirect) {
        clearAuthAndRedirectToLogin()
        return
      }
      console.error('API Error:', error)
      throw error
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  /**
   * PUT request
   */
  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  /**
   * PATCH request
   */
  async patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload(endpoint, formData, options = {}) {
    const token = this.getAuthToken()
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }
    // Don't set Content-Type for FormData, browser will set it automatically

    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers,
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export individual methods for convenience
export const { get, post, put, patch, delete: del, upload } = apiClient
