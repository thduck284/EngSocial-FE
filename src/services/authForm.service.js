import { apiClient } from '../utils/api.js'
import { API_ENDPOINTS } from '../constants/api.js'
import { applyUserLanguage } from '../utils/language.js'
import { validateRegisterForm } from '../validators/index.js'
import { validateLoginForm } from '../validators/index.js'

/**
 * Submit register: validate, call API, save auth on success.
 * @param {{ fullName: string, email: string, password: string, confirmPassword: string, agreeTerms: boolean }} data
 * @param {(key: string, opts?: object) => string} t
 * @returns {Promise<{ success: boolean, navigate?: boolean, error?: string, fieldErrors?: object }>}
 */
export async function submitRegisterForm(data, t) {
  const validation = validateRegisterForm(data, t)
  if (!validation.valid) {
    return { success: false, fieldErrors: validation.fieldErrors }
  }

  try {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
      email: (data.email || '').trim().toLowerCase(),
      password: data.password,
      name: (data.fullName || '').trim(),
    })

    if (res.success && res.data) {
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
    let fieldErrors = {}
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

/**
 * Submit login: validate, call API, save auth on success, apply user language.
 * Ghi nhớ đăng nhập (remember): true = localStorage, false = sessionStorage (hết khi đóng tab).
 * @param {{ email: string, password: string, remember?: boolean }} data
 * @param {{ t: (key: string) => string, changeLanguage: (lang: string) => void }} i18n
 * @returns {Promise<{ success: boolean, navigate?: boolean, error?: string, fieldErrors?: object }>}
 */
export async function submitLoginForm(data, i18n) {
  const validation = validateLoginForm(data, i18n.t)
  if (!validation.valid) {
    return { success: false, fieldErrors: validation.fieldErrors }
  }

  const remember = data.remember !== false
  const storage = remember ? localStorage : sessionStorage

  try {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: (data.email || '').trim().toLowerCase(),
      password: data.password,
    })

    if (res.success && res.data) {
      const { accessToken, refreshToken, user } = res.data
      if (accessToken) storage.setItem('authToken', accessToken)
      if (refreshToken) storage.setItem('refreshToken', refreshToken)
      if (user) {
        storage.setItem('user', JSON.stringify(user))
        applyUserLanguage(user, i18n)
        const lang = user.preferences?.language === 'vi' || user.preferences?.language === 'en' ? user.preferences.language : 'vi'
        storage.setItem('language', lang)
      }
      return { success: true, navigate: true }
    }

    return { success: false, error: res.message || i18n.t('auth.loginFailed') }
  } catch (err) {
    const msg = err?.message ?? err?.data?.message
    const errors = err?.data?.errors
    let fieldErrors = {}
    if (Array.isArray(errors) && errors.length) {
      errors.forEach((e) => {
        fieldErrors[e.field || 'email'] = e.message
      })
    }
    return {
      success: false,
      error: msg || i18n.t('auth.loginFailed'),
      ...(Object.keys(fieldErrors).length ? { fieldErrors } : {}),
    }
  }
}
