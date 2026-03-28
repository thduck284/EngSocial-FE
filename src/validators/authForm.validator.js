/**
 * Auth form validation: login + register.
 * Validators return null (valid) or { key, params? } for i18n t(key, params).
 */

import { getDobMaxIsoDateLocal, getDobMinIsoDateLocal } from '../utils/dobBounds.js'

export const REGISTER_VALIDATION = {
  fullName: { min: 2, max: 100 },
  email: { max: 255 },
  password: { min: 8, max: 128 },
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ----- Register: fullName, email, password, confirm, terms -----

export function validateFullName(value) {
  const v = (value ?? '').trim()
  if (!v) return { key: 'auth.validation.fullNameRequired' }
  if (v.length < REGISTER_VALIDATION.fullName.min) {
    return { key: 'auth.validation.fullNameMin', params: { min: REGISTER_VALIDATION.fullName.min } }
  }
  if (v.length > REGISTER_VALIDATION.fullName.max) {
    return { key: 'auth.validation.fullNameMax', params: { max: REGISTER_VALIDATION.fullName.max } }
  }
  return null
}

export function validateEmail(value) {
  const v = (value ?? '').trim()
  if (!v) return { key: 'auth.validation.emailRequired' }
  if (!EMAIL_REGEX.test(v)) return { key: 'auth.validation.emailInvalid' }
  if (v.length > REGISTER_VALIDATION.email.max) {
    return { key: 'auth.validation.emailMax', params: { max: REGISTER_VALIDATION.email.max } }
  }
  return null
}

export function validatePassword(value) {
  if (!value) return { key: 'auth.validation.passwordRequired' }
  if (value.length < REGISTER_VALIDATION.password.min) {
    return { key: 'auth.validation.passwordMin', params: { count: REGISTER_VALIDATION.password.min } }
  }
  if (value.length > REGISTER_VALIDATION.password.max) {
    return { key: 'auth.validation.passwordMax', params: { max: REGISTER_VALIDATION.password.max } }
  }
  if (!PASSWORD_REGEX.test(value)) return { key: 'auth.validation.passwordRule' }
  return null
}

export function validateConfirmPassword(password, confirmPassword) {
  if (password !== confirmPassword) return { key: 'auth.validation.confirmNotMatch' }
  return null
}

export function validateAgreeTerms(value) {
  if (!value) return { key: 'auth.validation.termsRequired' }
  return null
}

/** Gender: optional; nếu có thì phải male | female | other */
export function validateGender(value) {
  if (!value) return null
  if (!['male', 'female', 'other'].includes(value)) return { key: 'auth.validation.genderInvalid' }
  return null
}

/** Ngày sinh: optional; format YYYY-MM-DD, ngày lịch hợp lệ, trong [min, max] (không tương lai) */
export function validateDateOfBirth(value) {
  if (!value) return null
  const v = String(value).trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return { key: 'auth.validation.dateOfBirthInvalid' }
  const [ys, ms, ds] = v.split('-').map(Number)
  const cal = new Date(Date.UTC(ys, ms - 1, ds))
  if (cal.getUTCFullYear() !== ys || cal.getUTCMonth() !== ms - 1 || cal.getUTCDate() !== ds) {
    return { key: 'auth.validation.dateOfBirthInvalid' }
  }
  const max = getDobMaxIsoDateLocal()
  const min = getDobMinIsoDateLocal()
  if (v > max) return { key: 'auth.validation.dateOfBirthFuture' }
  if (v < min) return { key: 'auth.validation.dateOfBirthTooOld' }
  return null
}

export function validateRegisterForm(data, t) {
  const { fullName = '', email = '', password = '', confirmPassword = '', agreeTerms = false, gender = '', dateOfBirth = '' } = data
  const fieldErrors = {}

  const fullNameErr = validateFullName(fullName)
  if (fullNameErr) fieldErrors.fullName = fullNameErr.params ? t(fullNameErr.key, fullNameErr.params) : t(fullNameErr.key)

  const emailErr = validateEmail(email)
  if (emailErr) fieldErrors.email = emailErr.params ? t(emailErr.key, emailErr.params) : t(emailErr.key)

  const passwordErr = validatePassword(password)
  if (passwordErr) fieldErrors.password = passwordErr.params ? t(passwordErr.key, passwordErr.params) : t(passwordErr.key)

  const confirmErr = validateConfirmPassword(password, confirmPassword)
  if (confirmErr) fieldErrors.confirmPassword = t(confirmErr.key)

  const termsErr = validateAgreeTerms(agreeTerms)
  if (termsErr) fieldErrors.agreeTerms = t(termsErr.key)

  const genderErr = validateGender(gender)
  if (genderErr) fieldErrors.gender = t(genderErr.key)

  const dateErr = validateDateOfBirth(dateOfBirth)
  if (dateErr) fieldErrors.dateOfBirth = t(dateErr.key)

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  }
}

// ----- Login: email + password (required only) -----

export function validateLoginPassword(value) {
  if (!value) return { key: 'auth.validation.passwordRequired' }
  return null
}

export function validateLoginForm(data, t) {
  const { email = '', password = '' } = data
  const fieldErrors = {}

  const emailErr = validateEmail(email)
  if (emailErr) fieldErrors.email = emailErr.params ? t(emailErr.key, emailErr.params) : t(emailErr.key)

  const passwordErr = validateLoginPassword(password)
  if (passwordErr) fieldErrors.password = t(passwordErr.key)

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  }
}

/**
 * Reset password form: newPassword + confirmPassword.
 */
export function validateResetPasswordForm(data, t) {
  const { newPassword = '', confirmPassword = '' } = data
  const fieldErrors = {}

  const pErr = validatePassword(newPassword)
  if (pErr) fieldErrors.newPassword = pErr.params ? t(pErr.key, pErr.params) : t(pErr.key)

  const confirmErr = validateConfirmPassword(newPassword, confirmPassword)
  if (confirmErr) fieldErrors.confirmPassword = t(confirmErr.key)

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  }
}
