import { useState } from 'react'
import { authService } from '../services'
import { validateResetPasswordForm } from '../validators'

/**
 * Hook for Reset Password page: form state and submit.
 * @param {string} token - Reset token from URL
 * @param {Function} t - i18n t function
 * @returns {Object} newPassword, setNewPassword, confirmPassword, setConfirmPassword, showPassword, setShowPassword, loading, error, success, fieldErrors, handleSubmit, newPwdErr, confirmErr
 */
export function useResetPassword(token, t) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const validation = validateResetPasswordForm({ newPassword, confirmPassword }, t)
    if (!validation.valid) {
      setFieldErrors(validation.fieldErrors)
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(token, newPassword)
      setSuccess(true)
      setError('')
      setFieldErrors({})
    } catch (err) {
      const msg =
        (typeof err?.message === 'string' && err.message) ||
        (typeof err?.data?.message === 'string' && err.data.message) ||
        t('resetPassword.invalidToken')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    loading,
    error,
    success,
    fieldErrors,
    handleSubmit,
    newPwdErr: fieldErrors.newPassword,
    confirmErr: fieldErrors.confirmPassword,
  }
}
