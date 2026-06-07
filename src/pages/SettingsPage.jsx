import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../constants'
import { useAuth } from '../context/AuthContext'
import { LanguageSwitcher } from '../components/ui/common/LanguageSwitcher'
import { userService } from '../services'

const PW_OTP_COOLDOWN_MS = 60_000
const PW_OTP_FLOW_TTL_MS = 10 * 60 * 1000

function pwOtpCooldownKey(userId) {
  return `engsocial_pw_otp_until_${userId || 'anon'}`
}

function pwOtpFlowKey(userId) {
  return `engsocial_pw_otp_flow_${userId || 'anon'}`
}

function getPwOtpCooldownRemaining(userId) {
  if (!userId) return 0
  const until = parseInt(localStorage.getItem(pwOtpCooldownKey(userId)), 10)
  if (!until || Number.isNaN(until)) return 0
  return Math.max(0, until - Date.now())
}

function setPwOtpCooldown(userId, ms = PW_OTP_COOLDOWN_MS) {
  if (!userId) return
  localStorage.setItem(pwOtpCooldownKey(userId), String(Date.now() + ms))
}

function pwOtpVerifiedKey(userId) {
  return `engsocial_pw_otp_verified_${userId || 'anon'}`
}

function savePwOtpVerified(userId, otp) {
  if (!userId) return
  sessionStorage.setItem(pwOtpVerifiedKey(userId), JSON.stringify({ otp, verifiedAt: Date.now() }))
}

function loadPwOtpVerified(userId) {
  if (!userId) return null
  try {
    const raw = sessionStorage.getItem(pwOtpVerifiedKey(userId))
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data?.otp || !data?.verifiedAt || Date.now() - data.verifiedAt > PW_OTP_FLOW_TTL_MS) {
      sessionStorage.removeItem(pwOtpVerifiedKey(userId))
      return null
    }
    return data
  } catch {
    return null
  }
}

function clearPwOtpVerified(userId) {
  if (!userId) return
  sessionStorage.removeItem(pwOtpVerifiedKey(userId))
}

function savePwOtpFlow(userId) {
  if (!userId) return
  sessionStorage.setItem(pwOtpFlowKey(userId), JSON.stringify({ sentAt: Date.now() }))
}

function loadPwOtpFlow(userId) {
  if (!userId) return null
  try {
    const raw = sessionStorage.getItem(pwOtpFlowKey(userId))
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data?.sentAt || Date.now() - data.sentAt > PW_OTP_FLOW_TTL_MS) {
      clearPwOtpFlow(userId)
      return null
    }
    return data
  } catch {
    return null
  }
}

function pwUiStateKey(userId) {
  return `engsocial_pw_ui_${userId || 'anon'}`
}

function savePwUiState(userId, patch) {
  if (!userId) return
  let prev = {}
  try {
    const raw = sessionStorage.getItem(pwUiStateKey(userId))
    if (raw) prev = JSON.parse(raw) || {}
  } catch {
    prev = {}
  }
  sessionStorage.setItem(
    pwUiStateKey(userId),
    JSON.stringify({ ...prev, ...patch, savedAt: Date.now() })
  )
}

function loadPwUiState(userId) {
  if (!userId) return null
  try {
    const raw = sessionStorage.getItem(pwUiStateKey(userId))
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data?.savedAt || Date.now() - data.savedAt > PW_OTP_FLOW_TTL_MS) {
      sessionStorage.removeItem(pwUiStateKey(userId))
      return null
    }
    return data
  } catch {
    return null
  }
}

function clearPwUiState(userId) {
  if (!userId) return
  sessionStorage.removeItem(pwUiStateKey(userId))
}

function getRestoredPasswordEmailState(userId) {
  if (!userId) return null

  const verified = loadPwOtpVerified(userId)
  const flow = loadPwOtpFlow(userId)
  const ui = loadPwUiState(userId)
  const cooldownRemaining = getPwOtpCooldownRemaining(userId)
  const otpPending = Boolean(flow || cooldownRemaining > 0)

  if (!verified && !otpPending && !ui?.otpSent) return null

  return {
    showForm: ui?.showForm !== false,
    method: ui?.method === 'email' || verified || otpPending ? 'email' : 'password',
    otpSent: Boolean(verified || otpPending || ui?.otpSent),
    otpVerified: Boolean(verified),
    otp: verified?.otp || ui?.otp || '',
  }
}

function clearPwOtpFlow(userId) {
  if (!userId) return
  sessionStorage.removeItem(pwOtpFlowKey(userId))
}

function clearPwOtpSession(userId) {
  clearPwOtpFlow(userId)
  clearPwOtpVerified(userId)
  clearPwUiState(userId)
}

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { user, setAuth } = useAuth()
  const isVi = i18n.language?.startsWith('vi')
  
  const [activeTab, setActiveTab] = useState('account')
  
  const [profileData, setProfileData] = useState({
    name: user?.name || user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || '',
  })
  const [profileUpdating, setProfileUpdating] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
      })
    }
  }, [user])

  const handleUpdateProfile = async () => {
    setProfileUpdating(true)
    setProfileMessage('')
    try {
      const res = await userService.updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio
      })
      if (res?.success) {
        setAuth(res.data)  // res.data = { user: UserDTO }
        setProfileMessage(t('settings.updateSuccess'))
        setTimeout(() => setProfileMessage(''), 3000)
      } else {
        setProfileMessage(t('settings.updateError'))
      }
    } catch (error) {
      setProfileMessage(t('settings.updateError'))
    } finally {
      setProfileUpdating(false)
    }
  }

  // Change Password
  const [showPwForm, setShowPwForm] = useState(false)
  const [pwMethod, setPwMethod] = useState('password') // 'password' | 'email'
  const [pwOtpSent, setPwOtpSent] = useState(false)
  const [pwOtpVerified, setPwOtpVerified] = useState(false)
  const [pwOtpCooldownSec, setPwOtpCooldownSec] = useState(0)
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '', otp: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState('')
  const [pwMessageType, setPwMessageType] = useState('') // 'success' | 'error'

  const userId = user?.id || user?._id

  const syncPwOtpCooldown = useCallback(() => {
    const remaining = getPwOtpCooldownRemaining(userId)
    setPwOtpCooldownSec(Math.ceil(remaining / 1000))
  }, [userId])

  useEffect(() => {
    if (!userId) return

    syncPwOtpCooldown()
    const restored = getRestoredPasswordEmailState(userId)
    if (restored) {
      setShowPwForm(restored.showForm)
      setPwMethod(restored.method)
      if (restored.otpSent) setPwOtpSent(true)
      if (restored.otpVerified) setPwOtpVerified(true)
      if (restored.otp) {
        setPwData(prev => ({ ...prev, otp: restored.otp }))
      }
    }

    const timer = setInterval(syncPwOtpCooldown, 1000)
    return () => clearInterval(timer)
  }, [userId, syncPwOtpCooldown])

  useEffect(() => {
    if (!userId || pwMethod !== 'email') return
    if (!pwOtpSent && !pwOtpVerified) return
    savePwUiState(userId, {
      showForm: showPwForm,
      method: 'email',
      otpSent: pwOtpSent,
      otp: pwData.otp,
    })
  }, [userId, pwMethod, pwOtpSent, pwOtpVerified, showPwForm, pwData.otp])

  const resetPwForm = () => {
    setPwData({ currentPassword: '', newPassword: '', confirmPassword: '', otp: '' })
    setPwOtpSent(false)
    setPwOtpVerified(false)
    setPwMethod('password')
    setPwMessage('')
    setPwMessageType('')
    clearPwOtpSession(userId)
  }

  const handleRequestPasswordOtp = async () => {
    if (pwOtpCooldownSec > 0) {
      setPwMessage(t('settings.otpCooldown', { seconds: pwOtpCooldownSec }))
      setPwMessageType('error')
      return
    }
    setPwLoading(true)
    setPwMessage('')
    setPwMessageType('')
    try {
      const res = await userService.requestPasswordChange()
      if (res?.success) {
        const cooldownSec = res?.data?.cooldownSec ?? 60
        setPwOtpCooldown(userId, cooldownSec * 1000)
        syncPwOtpCooldown()
        setPwOtpSent(true)
        setPwOtpVerified(false)
        setPwData(prev => ({ ...prev, otp: '', newPassword: '', confirmPassword: '' }))
        savePwOtpFlow(userId)
        savePwUiState(userId, { showForm: true, method: 'email', otpSent: true, otp: '' })
        setPwMessage(t('settings.passwordOtpSent', { email: user?.email }))
        setPwMessageType('success')
      } else {
        setPwMessage(t('settings.passwordOtpFailed'))
        setPwMessageType('error')
      }
    } catch (err) {
      const waitSec = err?.data?.data?.waitSec ?? err?.data?.waitSec
      if (waitSec) {
        setPwOtpCooldown(userId, waitSec * 1000)
        syncPwOtpCooldown()
        setPwMessage(t('settings.otpCooldown', { seconds: waitSec }))
      } else {
        setPwMessage(t('settings.passwordOtpFailed'))
      }
      setPwMessageType('error')
    } finally {
      setPwLoading(false)
    }
  }

  const handleVerifyPasswordOtp = async () => {
    if (pwData.otp.length < 6) return
    setPwLoading(true)
    setPwMessage('')
    setPwMessageType('')
    try {
      const res = await userService.verifyPasswordChange(pwData.otp)
      if (res?.success) {
        setPwOtpVerified(true)
        savePwOtpVerified(userId, pwData.otp)
        sessionStorage.removeItem(pwOtpFlowKey(userId))
        savePwUiState(userId, { showForm: true, method: 'email', otpSent: true, otp: pwData.otp })
        setPwMessage(t('settings.otpVerified'))
        setPwMessageType('success')
      } else {
        setPwMessage(t('settings.otpInvalid'))
        setPwMessageType('error')
      }
    } catch {
      setPwMessage(t('settings.otpInvalid'))
      setPwMessageType('error')
    } finally {
      setPwLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (pwMethod === 'email' && !pwOtpVerified) {
      setPwMessage(t('settings.otpVerifyFirst'))
      setPwMessageType('error')
      return
    }
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwMessage(t('settings.passwordMismatch'))
      setPwMessageType('error')
      return
    }
    if (pwData.newPassword.length < 8) {
      setPwMessage(t('settings.passwordTooShort'))
      setPwMessageType('error')
      return
    }
    setPwLoading(true)
    setPwMessage('')
    setPwMessageType('')
    try {
      const payload =
        pwMethod === 'password'
          ? { currentPassword: pwData.currentPassword, newPassword: pwData.newPassword }
          : { otp: pwData.otp, newPassword: pwData.newPassword }
      const res = await userService.changePassword(payload)
      if (res?.success) {
        setPwMessage(t('settings.passwordChanged'))
        setPwMessageType('success')
        resetPwForm()
        setTimeout(() => { setPwMessage(''); setPwMessageType(''); setShowPwForm(false) }, 2500)
      } else {
        setPwMessage(
          pwMethod === 'password' ? t('settings.wrongPassword') : t('settings.otpInvalid')
        )
        setPwMessageType('error')
      }
    } catch (err) {
      const msg = err?.data?.message || ''
      if (msg.toLowerCase().includes('otp') || msg.toLowerCase().includes('hết hạn') || msg.toLowerCase().includes('expired')) {
        setPwMessage(t('settings.otpInvalid'))
      } else {
        setPwMessage(pwMethod === 'password' ? t('settings.wrongPassword') : t('settings.otpInvalid'))
      }
      setPwMessageType('error')
    } finally {
      setPwLoading(false)
    }
  }

  const canSubmitPassword =
    pwData.newPassword &&
    pwData.confirmPassword &&
    (pwMethod === 'password'
      ? pwData.currentPassword
      : pwOtpVerified)

  const canVerifyOtp = pwOtpSent && !pwOtpVerified && pwData.otp.length >= 6
  const canSendOtp = pwOtpCooldownSec <= 0 && !pwLoading

  // Change Email
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailStep, setEmailStep] = useState('password') // 'password' | 'input' | 'otp'
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('')
  const [emailPasswordVerified, setEmailPasswordVerified] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [emailMessageType, setEmailMessageType] = useState('')

  const resetEmailForm = () => {
    setEmailStep('password')
    setEmailCurrentPassword('')
    setEmailPasswordVerified(false)
    setNewEmail('')
    setOtp('')
    setEmailMessage('')
    setEmailMessageType('')
  }

  const handleVerifyEmailPassword = async () => {
    if (!emailCurrentPassword) return
    setEmailLoading(true)
    setEmailMessage('')
    setEmailMessageType('')
    try {
      const res = await userService.verifyEmailChangePassword(emailCurrentPassword)
      if (res?.success) {
        setEmailPasswordVerified(true)
        setEmailStep('input')
        setEmailMessage(t('settings.emailPasswordVerified'))
        setEmailMessageType('success')
      } else {
        setEmailMessage(t('settings.wrongPassword'))
        setEmailMessageType('error')
      }
    } catch {
      setEmailMessage(t('settings.wrongPassword'))
      setEmailMessageType('error')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleRequestEmailOtp = async () => {
    if (!emailPasswordVerified) {
      setEmailMessage(t('settings.emailPasswordRequired'))
      setEmailMessageType('error')
      return
    }
    setEmailLoading(true)
    setEmailMessage('')
    setEmailMessageType('')
    try {
      const res = await userService.requestEmailChange(newEmail)
      if (res?.success) {
        setEmailStep('otp')
        setEmailMessage(t('settings.emailOtpSent', { email: newEmail }))
        setEmailMessageType('success')
      } else {
        setEmailMessage(t('settings.emailTaken'))
        setEmailMessageType('error')
      }
    } catch (err) {
      const msg = err?.data?.message || ''
      if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('mật khẩu')) {
        setEmailPasswordVerified(false)
        setEmailStep('password')
        setEmailMessage(t('settings.emailPasswordRequired'))
      } else {
        setEmailMessage(t('settings.emailTaken'))
      }
      setEmailMessageType('error')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleConfirmEmailOtp = async () => {
    setEmailLoading(true)
    setEmailMessage('')
    setEmailMessageType('')
    try {
      const res = await userService.confirmEmailChange(otp)
      if (res?.success) {
        setAuth(res.data)
        setEmailMessage(t('settings.emailChanged'))
        setEmailMessageType('success')
        setTimeout(() => {
          setEmailMessage('')
          setEmailMessageType('')
          setShowEmailForm(false)
          resetEmailForm()
        }, 2500)
      } else {
        setEmailMessage(t('settings.otpInvalid'))
        setEmailMessageType('error')
      }
    } catch {
      setEmailMessage(t('settings.otpInvalid'))
      setEmailMessageType('error')
    } finally {
      setEmailLoading(false)
    }
  }

  // Delete Account
  const [deleteStep, setDeleteStep] = useState('idle') // 'idle' | 'confirm' | 'otp'
  const [deleteOtp, setDeleteOtp] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState('')

  const handleRequestDeleteOtp = async () => {
    setDeleteLoading(true)
    setDeleteMessage('')
    try {
      const res = await userService.requestDeleteAccount()
      if (res?.success) {
        setDeleteStep('otp')
        setDeleteMessage(isVi ? `Mã OTP đã gửi về ${user?.email}` : `OTP sent to ${user?.email}`)
      } else {
        setDeleteMessage(isVi ? 'Có lỗi xảy ra.' : 'Something went wrong.')
      }
    } catch {
      setDeleteMessage(isVi ? 'Có lỗi xảy ra.' : 'Something went wrong.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    setDeleteLoading(true)
    setDeleteMessage('')
    try {
      const res = await userService.confirmDeleteAccount(deleteOtp)
      if (res?.success) {
        // Clear all auth data and redirect
        ;['authToken', 'refreshToken', 'user'].forEach(k => {
          localStorage.removeItem(k)
          sessionStorage.removeItem(k)
        })
        window.location.href = '/login'
      } else {
        setDeleteMessage(isVi ? 'Mã OTP không đúng hoặc đã hết hạn.' : 'OTP is invalid or expired.')
      }
    } catch {
      setDeleteMessage(isVi ? 'Mã OTP không đúng hoặc đã hết hạn.' : 'OTP is invalid or expired.')
    } finally {
      setDeleteLoading(false)
    }
  }
  
  // Settings state (mocking persistence)
  const [settings, setSettings] = useState({
    darkMode: document.documentElement.classList.contains('dark'),
    sfx: localStorage.getItem('game_sfx') !== 'false',
    music: localStorage.getItem('game_music') !== 'false',
    profilePublic: true,
    emailNotifications: true,
  })

  const toggleSetting = (key) => {
    const newValue = !settings[key]
    setSettings(prev => ({ ...prev, [key]: newValue }))
    
    if (key === 'darkMode') {
      if (newValue) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    } else if (key === 'sfx') {
      localStorage.setItem('game_sfx', newValue)
    } else if (key === 'music') {
      localStorage.setItem('game_music', newValue)
    }
  }

  const tabs = [
    { id: 'account', icon: 'person', label: t('settings.account') },
    { id: 'appearance', icon: 'palette', label: t('settings.appearance') },
    { id: 'privacy', icon: 'shield', label: t('settings.privacy') },
  ]

  // Blocked Users
  const [showBlockedModal, setShowBlockedModal] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState([])
  const [blockedLoading, setBlockedLoading] = useState(false)

  const fetchBlockedUsers = async () => {
    setBlockedLoading(true)
    try {
      const res = await userService.getBlockedUsers()
      if (res?.success) {
        setBlockedUsers(res.data.blockedUsers || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setBlockedLoading(false)
    }
  }

  const handleUnblock = async (userId) => {
    try {
      const res = await userService.unblockUser(userId)
      if (res?.success) {
        setBlockedUsers(prev => prev.filter(u => u.id !== userId))
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (showBlockedModal) {
      fetchBlockedUsers()
    }
  }, [showBlockedModal])

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 min-h-[calc(100vh-80px)]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link to={ROUTES.HOME} className="hover:text-primary flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-[18px]">home</span>
              {t('header.home')}
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">{t('settings.title')}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('settings.subtitle')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t('settings.desc')}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-1'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 p-6 sm:p-10 shadow-sm backdrop-blur-sm">
          
          {activeTab === 'account' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <section>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">person</span>
                  </span>
                  {t('settings.personalInfo')}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('settings.fullName')}</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder={isVi ? 'Nhập họ và tên' : 'Enter your full name'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('settings.phone')}</label>
                      <input
                        type="text"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder={isVi ? 'Nhập số điện thoại' : 'Enter phone number'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('settings.address')}</label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder={isVi ? 'Nhập địa chỉ của bạn' : 'Enter your address'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('settings.bio')}</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary resize-none h-24 custom-scrollbar"
                      placeholder={t('settings.bioPlaceholder')}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={profileUpdating}
                      className="px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {profileUpdating ? t('settings.saving') : t('settings.saveChanges')}
                    </button>
                    {profileMessage && (
                      <span className={`text-sm font-medium ${profileMessage.includes('thành công') || profileMessage.includes('successfully') ? 'text-emerald-500' : 'text-red-500'}`}>
                        {profileMessage}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              <section className="pt-8 border-t border-slate-100 dark:border-white/5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="size-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">mail</span>
                  </span>
                  {t('settings.loginInfo')}
                </h3>
                <div className="space-y-4">

                  {/* Email Change */}
                  <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('settings.currentEmail')}</p>
                        <p className="text-slate-900 dark:text-white font-medium">{user?.email || 'user@example.com'}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (showEmailForm) {
                            resetEmailForm()
                            setShowEmailForm(false)
                          } else {
                            setShowEmailForm(true)
                          }
                        }}
                        className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-primary border border-slate-200 dark:border-white/10 rounded-lg hover:bg-primary hover:text-white transition-all"
                      >
                        {showEmailForm ? t('settings.cancel') : t('settings.change')}
                      </button>
                    </div>
                    {showEmailForm && (
                      <div className="px-4 pb-4 border-t border-slate-100 dark:border-white/5 pt-4 space-y-3">
                        {emailStep === 'password' ? (
                          <>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings.emailPasswordHint')}</p>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('settings.currentPassword')}</label>
                              <input
                                type="password"
                                value={emailCurrentPassword}
                                onChange={e => setEmailCurrentPassword(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="••••••••"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={handleVerifyEmailPassword}
                                disabled={emailLoading || !emailCurrentPassword}
                                className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50"
                              >
                                {emailLoading ? t('settings.verifyingPassword') : t('settings.verifyPassword')}
                              </button>
                              {emailMessage && (
                                <span className={`text-xs font-medium ${emailMessageType === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {emailMessage}
                                </span>
                              )}
                            </div>
                          </>
                        ) : emailStep === 'input' ? (
                          <>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                              <span className="material-symbols-outlined text-emerald-500 text-[18px]">verified</span>
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{t('settings.emailPasswordVerified')}</span>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('settings.newEmail')}</label>
                              <input
                                type="email"
                                value={newEmail}
                                onChange={e => setNewEmail(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="new@example.com"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={handleRequestEmailOtp}
                                disabled={emailLoading || !newEmail}
                                className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50"
                              >
                                {emailLoading ? t('settings.sendingOtp') : t('settings.sendOtp')}
                              </button>
                              {emailMessage && (
                                <span className={`text-xs font-medium ${emailMessageType === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {emailMessage}
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            {emailMessage && (
                              <p className={`text-xs font-medium ${emailMessageType === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {emailMessage}
                              </p>
                            )}
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('settings.enterOtp')}</label>
                              <input
                                type="text"
                                value={otp}
                                maxLength={6}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-sm text-center tracking-[0.3em] font-mono font-bold text-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="------"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={handleConfirmEmailOtp}
                                disabled={emailLoading || otp.length < 6}
                                className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50"
                              >
                                {emailLoading ? t('settings.confirmingOtp') : t('settings.confirmEmailChange')}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setEmailStep('input'); setOtp(''); setEmailMessage(''); setEmailMessageType('') }}
                                className="text-xs text-slate-500 hover:text-primary"
                              >
                                {t('settings.backToNewEmail')}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Password Change */}
                  <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('settings.password')}</p>
                        <p className="text-slate-900 dark:text-white font-medium">••••••••••••</p>
                      </div>
                      <button
                        onClick={() => {
                          if (showPwForm) {
                            resetPwForm()
                            setShowPwForm(false)
                          } else {
                            setShowPwForm(true)
                          }
                        }}
                        className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-primary border border-slate-200 dark:border-white/10 rounded-lg hover:bg-primary hover:text-white transition-all"
                      >
                        {showPwForm ? t('settings.cancel') : t('settings.update')}
                      </button>
                    </div>
                    {showPwForm && (
                      <div className="px-4 pb-4 border-t border-slate-100 dark:border-white/5 pt-4 space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPwMethod('password')
                              setPwOtpSent(false)
                              setPwOtpVerified(false)
                              setPwMessage('')
                              setPwMessageType('')
                              clearPwOtpSession(userId)
                              setPwData(prev => ({ ...prev, otp: '', newPassword: '', confirmPassword: '' }))
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              pwMethod === 'password'
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-primary/40'
                            }`}
                          >
                            {t('settings.passwordMethodCurrent')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPwMethod('email')
                              setPwMessage('')
                              setPwMessageType('')
                              setPwData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
                              const cooldownRemaining = getPwOtpCooldownRemaining(userId)
                              const flow = loadPwOtpFlow(userId)
                              const verified = loadPwOtpVerified(userId)
                              if (verified) {
                                setPwOtpSent(true)
                                setPwOtpVerified(true)
                                setPwData(prev => ({ ...prev, otp: verified.otp }))
                              } else {
                                setPwOtpVerified(false)
                                if (flow || cooldownRemaining > 0) setPwOtpSent(true)
                              }
                              savePwUiState(userId, {
                                showForm: true,
                                method: 'email',
                                otpSent: Boolean(flow || cooldownRemaining > 0 || verified),
                                otp: verified?.otp || '',
                              })
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              pwMethod === 'email'
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-primary/40'
                            }`}
                          >
                            {t('settings.passwordMethodEmail')}
                          </button>
                        </div>

                        {pwMethod === 'password' ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('settings.currentPassword')}</label>
                              <input
                                type="password"
                                value={pwData.currentPassword}
                                onChange={e => setPwData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="••••••••"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {t('settings.passwordEmailHint', { email: user?.email || '—' })}
                            </p>

                            {!pwOtpSent ? (
                              <div className="flex flex-wrap items-center gap-3">
                                <button
                                  type="button"
                                  onClick={handleRequestPasswordOtp}
                                  disabled={!canSendOtp}
                                  className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {pwLoading
                                    ? t('settings.sendingOtp')
                                    : pwOtpCooldownSec > 0
                                      ? t('settings.resendOtpIn', { seconds: pwOtpCooldownSec })
                                      : t('settings.sendOtp')}
                                </button>
                              </div>
                            ) : !pwOtpVerified ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('settings.enterOtp')}</label>
                                  <input
                                    type="text"
                                    value={pwData.otp}
                                    maxLength={6}
                                    onChange={e => setPwData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-sm text-center tracking-[0.3em] font-mono font-bold text-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    placeholder="------"
                                  />
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={handleVerifyPasswordOtp}
                                    disabled={pwLoading || !canVerifyOtp}
                                    className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50"
                                  >
                                    {pwLoading ? t('settings.verifyingOtp') : t('settings.verifyOtp')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleRequestPasswordOtp}
                                    disabled={!canSendOtp}
                                    className="text-xs text-slate-500 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {pwOtpCooldownSec > 0
                                      ? t('settings.resendOtpIn', { seconds: pwOtpCooldownSec })
                                      : t('settings.resendOtp')}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <span className="material-symbols-outlined text-emerald-500 text-[18px]">verified</span>
                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{t('settings.otpVerified')}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {(pwMethod === 'password' || pwOtpVerified) && (
                        <div className="space-y-3 pt-1">
                          {[['newPassword', t('settings.newPassword')], ['confirmPassword', t('settings.confirmNewPassword')]].map(([key, label]) => (
                            <div key={key}>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</label>
                              <input
                                type="password"
                                value={pwData[key]}
                                onChange={e => setPwData(prev => ({ ...prev, [key]: e.target.value }))}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="••••••••"
                              />
                            </div>
                          ))}
                        </div>
                        )}

                        {(pwMethod === 'password' || pwOtpVerified) && (
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={handleChangePassword}
                            disabled={pwLoading || !canSubmitPassword}
                            className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50"
                          >
                            {pwLoading ? t('settings.saving') : t('settings.changePassword')}
                          </button>
                          {pwMessage && (
                            <span className={`text-xs font-medium ${pwMessageType === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                              {pwMessage}
                            </span>
                          )}
                        </div>
                        )}

                        {pwMethod === 'email' && !pwOtpVerified && pwMessage && (
                          <p className={`text-xs font-medium ${pwMessageType === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {pwMessage}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </section>

              <section className="pt-8 border-t border-slate-100 dark:border-white/5">
                <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  {t('settings.dangerZone')}
                </h3>
                <div className="rounded-2xl bg-red-500/5 border border-red-500/20 overflow-hidden">
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">{t('settings.deleteBtn')}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t('settings.deleteDesc')}</p>
                    </div>
                    {deleteStep === 'idle' && (
                      <button
                        onClick={() => setDeleteStep('confirm')}
                        className="shrink-0 px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                      >
                        {t('settings.deleteBtn')}
                      </button>
                    )}
                  </div>

                  {deleteStep === 'confirm' && (
                    <div className="px-5 pb-5 border-t border-red-500/10 pt-4 space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5 shrink-0">error</span>
                        <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed font-medium">
                          {isVi
                            ? 'Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.'
                            : 'This action cannot be undone. All your data will be permanently deleted.'}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isVi
                          ? `Mã OTP sẽ được gửi đến email: `
                          : `OTP will be sent to: `}
                        <span className="font-bold text-slate-700 dark:text-slate-300">{user?.email}</span>
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleRequestDeleteOtp}
                          disabled={deleteLoading}
                          className="px-5 py-2 text-sm font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all"
                        >
                          {deleteLoading ? (isVi ? 'Đang gửi...' : 'Sending...') : (isVi ? 'Gửi mã OTP' : 'Send OTP')}
                        </button>
                        <button
                          onClick={() => { setDeleteStep('idle'); setDeleteMessage('') }}
                          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          {isVi ? 'Hủy' : 'Cancel'}
                        </button>
                      </div>
                      {deleteMessage && <p className="text-xs text-red-500 font-medium">{deleteMessage}</p>}
                    </div>
                  )}

                  {deleteStep === 'otp' && (
                    <div className="px-5 pb-5 border-t border-red-500/10 pt-4 space-y-3">
                      {deleteMessage && <p className="text-xs text-emerald-500 font-medium">{deleteMessage}</p>}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                          {isVi ? 'Nhập mã OTP (6 số)' : 'Enter OTP (6 digits)'}
                        </label>
                        <input
                          type="text"
                          value={deleteOtp}
                          maxLength={6}
                          onChange={e => setDeleteOtp(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-white dark:bg-slate-800 border border-red-300 dark:border-red-500/30 rounded-xl p-3 text-slate-900 dark:text-white text-center tracking-[0.3em] font-mono font-bold text-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="------"
                          autoFocus
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleConfirmDelete}
                          disabled={deleteLoading || deleteOtp.length < 6}
                          className="px-5 py-2 text-sm font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all"
                        >
                          {deleteLoading
                            ? (isVi ? 'Đang xóa...' : 'Deleting...')
                            : (isVi ? 'Xác nhận xóa tài khoản' : 'Confirm Delete Account')}
                        </button>
                        <button
                          onClick={() => { setDeleteStep('confirm'); setDeleteOtp(''); setDeleteMessage('') }}
                          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          {isVi ? 'Gửi lại OTP' : 'Resend OTP'}
                        </button>
                        <button
                          onClick={() => { setDeleteStep('idle'); setDeleteOtp(''); setDeleteMessage('') }}
                          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          {isVi ? 'Hủy' : 'Cancel'}
                        </button>
                      </div>
                      {deleteMessage && !deleteMessage.includes('gửi') && !deleteMessage.includes('sent') && (
                        <p className="text-xs text-red-500 font-medium">{deleteMessage}</p>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('settings.language')}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.languageDesc')}</p>
                  </div>
                  <LanguageSwitcher />
                </div>
              </section>

              <section className="pt-10 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('settings.darkMode')}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.darkModeDesc')}</p>
                  </div>
                  <button 
                    onClick={() => toggleSetting('darkMode')}
                    className={`relative w-16 h-8 rounded-full transition-all duration-500 focus:outline-none shadow-inner ${settings.darkMode ? 'bg-primary' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 size-6 bg-white rounded-full transition-all duration-500 transform ${settings.darkMode ? 'left-9 rotate-[360deg]' : 'left-1 rotate-0'} flex items-center justify-center shadow-lg`}>
                      <span className="material-symbols-outlined text-[14px] text-slate-900">
                        {settings.darkMode ? 'dark_mode' : 'light_mode'}
                      </span>
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    onClick={() => settings.darkMode && toggleSetting('darkMode')}
                    className={`relative group p-4 rounded-2xl border-2 transition-all ${!settings.darkMode ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 bg-slate-50 dark:bg-white/5'}`}
                  >
                    <div className="aspect-[4/3] rounded-xl bg-slate-100 mb-4 overflow-hidden border border-slate-200 p-2 space-y-2">
                       <div className="h-2 w-1/2 bg-slate-300 rounded-full" />
                       <div className="h-8 w-full bg-white rounded-lg shadow-sm" />
                       <div className="grid grid-cols-2 gap-2">
                          <div className="h-10 bg-white rounded-lg shadow-sm" />
                          <div className="h-10 bg-white rounded-lg shadow-sm" />
                       </div>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">Light Mode</p>
                    <p className="text-xs text-slate-500 mt-1">Clean and professional for daytime use</p>
                    {!settings.darkMode && (
                      <div className="absolute top-4 right-4 size-6 bg-primary text-white rounded-full flex items-center justify-center animate-in zoom-in">
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </div>
                    )}
                  </button>

                  <button 
                    onClick={() => !settings.darkMode && toggleSetting('darkMode')}
                    className={`relative group p-4 rounded-2xl border-2 transition-all ${settings.darkMode ? 'border-primary bg-primary/10 shadow-xl shadow-primary/20' : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 bg-slate-50 dark:bg-white/5'}`}
                  >
                    <div className="aspect-[4/3] rounded-xl bg-[#0a0f12] mb-4 overflow-hidden border border-[#1a1f22] p-2 space-y-2">
                       <div className="h-2 w-1/2 bg-slate-700 rounded-full" />
                       <div className="h-8 w-full bg-[#111e22] rounded-lg border border-[#325a67]" />
                       <div className="grid grid-cols-2 gap-2">
                          <div className="h-10 bg-[#111e22] rounded-lg border border-[#325a67]" />
                          <div className="h-10 bg-[#111e22] rounded-lg border border-[#325a67]" />
                       </div>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">Dark Mode</p>
                    <p className="text-xs text-slate-500 mt-1">Easier on the eyes in low light conditions</p>
                    {settings.darkMode && (
                      <div className="absolute top-4 right-4 size-6 bg-primary text-white rounded-full flex items-center justify-center animate-in zoom-in">
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </div>
                    )}
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
              <section>
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="size-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">block</span>
                      </span>
                      {isVi ? 'Người dùng đã chặn' : 'Blocked Users'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      {isVi 
                        ? 'Quản lý danh sách những người bạn đã chặn. Họ sẽ không thể gửi tin nhắn cho bạn.' 
                        : 'Manage the list of users you have blocked. They will not be able to message you.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBlockedModal(true)}
                    className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-xl font-bold text-sm transition-all"
                  >
                    {isVi ? 'Xem danh sách' : 'View list'}
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Blocked Users Modal */}
      {showBlockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">block</span>
                {isVi ? 'Người dùng đã chặn' : 'Blocked Users'}
              </h3>
              <button
                onClick={() => setShowBlockedModal(false)}
                className="size-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {blockedLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                  <p className="text-sm text-slate-500">{t('common.loading')}</p>
                </div>
              ) : blockedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                  <div className="size-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">person_off</span>
                  </div>
                  <p className="text-slate-500 font-medium">
                    {isVi ? 'Bạn chưa chặn ai.' : 'You haven\'t blocked anyone.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blockedUsers.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group transition-colors hover:border-slate-200 dark:hover:border-white/10">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} alt={u.name} className="size-10 rounded-full object-cover shadow-sm" />
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{u.name}</p>
                          <p className="text-[11px] font-medium text-slate-500">Lv. {u.level}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnblock(u.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-200/50 dark:bg-white/10 text-slate-700 dark:text-white text-xs font-bold hover:bg-slate-300 dark:hover:bg-white/20 transition-all active:scale-95"
                      >
                        {isVi ? 'Bỏ chặn' : 'Unblock'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
