import { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { submitRegisterForm, submitLoginForm, authService } from '../services'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants'

// ─── useRegister ─────────────────────────────────────────────────────────────

export function useRegister() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [gender, setGender] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const clearFieldError = useCallback((field) => {
    setFieldErrors((p) => {
      const next = { ...p }
      delete next[field]
      return next
    })
  }, [])

  const updateField = useCallback((field, value) => {
    switch (field) {
      case 'fullName': setFullName(value); break
      case 'email': setEmail(value); break
      case 'password': setPassword(value); break
      case 'confirmPassword': setConfirmPassword(value); break
      case 'gender': setGender(value); break
      case 'dateOfBirth': setDateOfBirth(value); break
      case 'agreeTerms': setAgreeTerms(value); break
      default: break
    }
    clearFieldError(field)
  }, [clearFieldError])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    setLoading(true)
    try {
      const result = await submitRegisterForm(
        { fullName, email, password, confirmPassword, gender, dateOfBirth, agreeTerms },
        t
      )

      if (result.success) {
        if (result.navigate) {
          const lang = localStorage.getItem('language')
          if (lang === 'vi' || lang === 'en') {
            authService.updatePreferences({ language: lang }).catch(() => {})
          }
          navigate(ROUTES.HOME, { replace: true })
        }
        return
      }

      if (result.error) setError(result.error)
      if (result.fieldErrors) setFieldErrors(result.fieldErrors)
    } finally {
      setLoading(false)
    }
  }, [fullName, email, password, confirmPassword, gender, dateOfBirth, agreeTerms, t, navigate])

  const toggleShowPassword = useCallback(() => setShowPassword((v) => !v), [])

  return {
    fullName,
    email,
    password,
    confirmPassword,
    gender,
    dateOfBirth,
    showPassword,
    agreeTerms,
    loading,
    error,
    fieldErrors,
    updateField,
    handleSubmit,
    toggleShowPassword,
  }
}

// ─── useLogin ────────────────────────────────────────────────────────────────

export function useLogin() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const clearFieldError = useCallback((field) => {
    setFieldErrors((p) => {
      const next = { ...p }
      delete next[field]
      return next
    })
  }, [])

  const updateField = useCallback((field, value) => {
    switch (field) {
      case 'email': setEmail(value); break
      case 'password': setPassword(value); break
      case 'remember': setRemember(value); break
      default: break
    }
    clearFieldError(field)
  }, [clearFieldError])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    setLoading(true)
    try {
      const result = await submitLoginForm(
        { email, password, remember },
        { t, changeLanguage: i18n.changeLanguage.bind(i18n) }
      )

      if (result.success) {
        if (result.navigate) {
          setAuth() // đồng bộ user từ storage vào context
          const from = location.state?.from?.pathname || ROUTES.HOME
          navigate(from, { replace: true })
        }
        return
      }

      if (result.error) setError(result.error)
      if (result.fieldErrors) setFieldErrors(result.fieldErrors)
    } finally {
      setLoading(false)
    }
  }, [email, password, remember, t, i18n, navigate, location, setAuth])

  const toggleShowPassword = useCallback(() => setShowPassword((v) => !v), [])

  return {
    email,
    password,
    showPassword,
    remember,
    loading,
    error,
    fieldErrors,
    updateField,
    handleSubmit,
    toggleShowPassword,
  }
}
