import { useState } from 'react'
import { authService } from '../services'
import { validateEmail } from '../validators'

/**
 * Hook for Forgot Password page: form state and submit.
 * @param {Function} t - i18n t function
 * @returns {Object} email, setEmail, loading, error, success, fieldErrors, handleSubmit, hasError, showSuccess
 */
export function useForgotPassword(t) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const emailErr = validateEmail(email)
    if (emailErr) {
      setFieldErrors({
        email: emailErr.params ? t(emailErr.key, emailErr.params) : t(emailErr.key),
      })
      return
    }

    setLoading(true)
    try {
      await authService.forgotPassword(email.trim().toLowerCase())
      setSuccess(true)
      setError('')
      setFieldErrors({})
    } catch (err) {
      const msg = err?.message ?? err?.data?.message ?? t('forgotPassword.error')
      setError(msg)
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    loading,
    error,
    success,
    fieldErrors,
    handleSubmit,
    hasError: !!fieldErrors.email,
    showSuccess: success && !error,
  }
}
