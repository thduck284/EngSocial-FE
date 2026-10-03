import { apiClient } from '../utils/api'
import { API_ENDPOINTS } from '../constants'
import { applyUserLanguage } from '../utils/language'
import { validateRegisterForm, validateLoginForm } from '../validators'

export const authService = {
  login: async (email, password) => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password })
  },

  loginWithGoogle: async (idToken) => {
    return apiClient.post(API_ENDPOINTS.AUTH.SOCIAL_GOOGLE, { idToken })
  },

  loginWithFacebook: async (accessToken) => {
    return apiClient.post(API_ENDPOINTS.AUTH.SOCIAL_FACEBOOK, { accessToken })
  },

  register: async (userData) => {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData)
  },

  logout: async () => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
  },

  refreshToken: async (refreshToken) => {
    return apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken })
  },

  forgotPassword: async (email) => {
    return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
  },

  resetPassword: async (token, newPassword) => {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword })
  },

  verifyEmail: async (token) => {
    return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token })
  },

  resendVerification: async (email) => {
    return apiClient.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email })
  },

  getMe: async () => {
    return apiClient.get(API_ENDPOINTS.AUTH.ME)
  },

  updatePreferences: async (payload) => {
    return apiClient.patch(API_ENDPOINTS.AUTH.PREFERENCES, payload)
  },
}

function storeAuthFromResponse(res, remember, i18n) {
  // Always use localStorage for tokens to ensure crossing tabs works correctly.
  // The 'remember' flag can still be used for other UI logic if needed.
  const storage = localStorage 

  const { accessToken, refreshToken, user } = res?.data || {}
  if (accessToken) storage.setItem('authToken', accessToken)
  if (refreshToken) storage.setItem('refreshToken', refreshToken)
  if (user) {
    storage.setItem('user', JSON.stringify(user))
    applyUserLanguage(user, i18n)
    const lang =
      user.preferences?.language === 'vi' || user.preferences?.language === 'en'
        ? user.preferences.language
        : 'vi'
    storage.setItem('language', lang)
  }
}

export async function submitRegisterForm(data, t) {
  const validation = validateRegisterForm(data, t)
  if (!validation.valid) {
    return { success: false, fieldErrors: validation.fieldErrors }
  }

  try {
    const body = {
      email: (data.email || '').trim().toLowerCase(),
      password: data.password,
      name: (data.fullName || '').trim(),
    }
    if (data.gender && ['male', 'female', 'other'].includes(data.gender)) body.gender = data.gender
    if (data.dateOfBirth) body.dateOfBirth = data.dateOfBirth
    const res = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, body)

    if (res.success && res.data) {
      if (res.data.requiresEmailVerification) {
        return {
          success: true,
          requiresVerification: true,
          email: res.data.email || body.email,
        }
      }

      const { accessToken, refreshToken, user } = res.data
      if (accessToken) localStorage.setItem('authToken', accessToken)
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
      if (user) localStorage.setItem('user', JSON.stringify(user))
      return { success: true, navigate: true }
    }

    return { success: false, error: res.message || t('auth.registerFailed') }
  } catch (err) {
    const msg = err?.message ?? err?.data?.message
    const errors = err?.data?.errors
    const fieldErrors = {}
    if (Array.isArray(errors) && errors.length) {
      errors.forEach((e) => {
        const key = e.field === 'name' ? 'fullName' : e.field
        fieldErrors[key] = e.message
      })
    }
    return {
      success: false,
      error: msg || t('auth.registerFailed'),
      ...(Object.keys(fieldErrors).length ? { fieldErrors } : {}),
    }
  }
}

export async function submitLoginForm(data, i18n) {
  const validation = validateLoginForm(data, i18n.t)
  if (!validation.valid) {
    return { success: false, fieldErrors: validation.fieldErrors }
  }

  const remember = data.remember !== false

  try {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: (data.email || '').trim().toLowerCase(),
      password: data.password,
    })

    if (res.success && res.data) {
      storeAuthFromResponse(res, remember, i18n)
      return { success: true, navigate: true }
    }

    return { success: false, error: res.message || i18n.t('auth.loginFailed') }
  } catch (err) {
    const msg = err?.isNetworkError
      ? i18n.t('auth.networkError')
      : err?.message ?? err?.data?.message
    const messageKey = err?.data?.messageKey
    const errors = err?.data?.errors
    const fieldErrors = {}
    if (Array.isArray(errors) && errors.length) {
      errors.forEach((e) => {
        fieldErrors[e.field || 'email'] = e.message
      })
    }
    return {
      success: false,
      error: msg || i18n.t('auth.loginFailed'),
      emailNotVerified: messageKey === 'auth.emailNotVerified',
      ...(Object.keys(fieldErrors).length ? { fieldErrors } : {}),
    }
  }
}

export async function submitSocialLogin({ provider, token, remember }, i18n) {
  const useRemember = remember !== false
  try {
    const res =
      provider === 'google'
        ? await authService.loginWithGoogle(token)
        : await authService.loginWithFacebook(token)

    if (res?.success && res?.data) {
      storeAuthFromResponse(res, useRemember, i18n)
      return { success: true, navigate: true }
    }
    return { success: false, error: res?.message || i18n.t('auth.loginFailed') }
  } catch (err) {
    const msg = err?.isNetworkError
      ? i18n.t('auth.networkError')
      : err?.message ?? err?.data?.message
    return { success: false, error: msg || i18n.t('auth.loginFailed') }
  }
}
