/**
 * Auth form validation: login + register.
 * Validators return null (valid) or { key, params? } for i18n t(key, params).
 */

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

export function validateRegisterForm(data, t) {
  const { fullName = '', email = '', password = '', confirmPassword = '', agreeTerms = false } = data
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
