import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../constants'
import { useAuth } from '../context/AuthContext'
import { LanguageSwitcher } from '../components/ui/common/LanguageSwitcher'
import { userService } from '../services'

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
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState('')

  const handleChangePassword = async () => {
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwMessage(isVi ? 'Mật khẩu xác nhận không khớp.' : 'Passwords do not match.')
      return
    }
    setPwLoading(true)
    setPwMessage('')
    try {
      const res = await userService.changePassword({ currentPassword: pwData.currentPassword, newPassword: pwData.newPassword })
      if (res?.success) {
        setPwMessage(isVi ? 'Đổi mật khẩu thành công!' : 'Password changed successfully!')
        setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => { setPwMessage(''); setShowPwForm(false) }, 2500)
      } else {
        setPwMessage(isVi ? 'Mật khẩu hiện tại không đúng.' : 'Current password is incorrect.')
      }
    } catch {
      setPwMessage(isVi ? 'Mật khẩu hiện tại không đúng.' : 'Current password is incorrect.')
    } finally {
      setPwLoading(false)
    }
  }

  // Change Email
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailStep, setEmailStep] = useState('input') // 'input' | 'otp'
  const [newEmail, setNewEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')

  const handleRequestEmailOtp = async () => {
    setEmailLoading(true)
    setEmailMessage('')
    try {
      const res = await userService.requestEmailChange(newEmail)
      if (res?.success) {
        setEmailStep('otp')
        setEmailMessage(isVi ? `Mã OTP đã gửi đến ${newEmail}` : `OTP sent to ${newEmail}`)
      } else {
        setEmailMessage(isVi ? 'Email này đã được sử dụng.' : 'This email is already taken.')
      }
    } catch {
      setEmailMessage(isVi ? 'Email này đã được sử dụng hoặc có lỗi.' : 'Email is taken or an error occurred.')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleConfirmEmailOtp = async () => {
    setEmailLoading(true)
    setEmailMessage('')
    try {
      const res = await userService.confirmEmailChange(otp)
      if (res?.success) {
        setAuth(res.data)  // res.data = { user: UserDTO }
        setEmailMessage(isVi ? 'Đổi email thành công!' : 'Email changed successfully!')
        setTimeout(() => { setEmailMessage(''); setShowEmailForm(false); setEmailStep('input'); setNewEmail(''); setOtp('') }, 2500)
      } else {
        setEmailMessage(isVi ? 'Mã OTP không đúng hoặc đã hết hạn.' : 'OTP is invalid or expired.')
      }
    } catch {
      setEmailMessage(isVi ? 'Mã OTP không đúng hoặc đã hết hạn.' : 'OTP is invalid or expired.')
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
  ]

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
                        onClick={() => { setShowEmailForm(v => !v); setEmailStep('input'); setEmailMessage('') }}
                        className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-primary border border-slate-200 dark:border-white/10 rounded-lg hover:bg-primary hover:text-white transition-all"
                      >
                        {showEmailForm ? (isVi ? 'Ẩn' : 'Cancel') : t('settings.change')}
                      </button>
                    </div>
                    {showEmailForm && (
                      <div className="px-4 pb-4 border-t border-slate-100 dark:border-white/5 pt-4 space-y-3">
                        {emailStep === 'input' ? (
                          <>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{isVi ? 'Email mới' : 'New Email'}</label>
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
                                onClick={handleRequestEmailOtp}
                                disabled={emailLoading || !newEmail}
                                className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50"
                              >
                                {emailLoading ? (isVi ? 'Đang gửi...' : 'Sending...') : (isVi ? 'Gửi mã OTP' : 'Send OTP')}
                              </button>
                              {emailMessage && <span className={`text-xs font-medium ${emailMessage.includes('gửi') || emailMessage.includes('sent') ? 'text-emerald-500' : 'text-red-500'}`}>{emailMessage}</span>}
                            </div>
                          </>
                        ) : (
                          <>
                            {emailMessage && <p className="text-xs text-emerald-500 font-medium">{emailMessage}</p>}
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{isVi ? 'Nhập mã OTP (6 số)' : 'Enter OTP (6 digits)'}</label>
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
                                onClick={handleConfirmEmailOtp}
                                disabled={emailLoading || otp.length < 6}
                                className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50"
                              >
                                {emailLoading ? (isVi ? 'Đang xác nhận...' : 'Confirming...') : (isVi ? 'Xác nhận' : 'Confirm')}
                              </button>
                              <button onClick={() => { setEmailStep('input'); setOtp(''); setEmailMessage('') }} className="text-xs text-slate-500 hover:text-primary">
                                {isVi ? 'Gửi lại' : 'Resend'}
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
                        onClick={() => { setShowPwForm(v => !v); setPwMessage('') }}
                        className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-primary border border-slate-200 dark:border-white/10 rounded-lg hover:bg-primary hover:text-white transition-all"
                      >
                        {showPwForm ? (isVi ? 'Ẩn' : 'Cancel') : t('settings.update')}
                      </button>
                    </div>
                    {showPwForm && (
                      <div className="px-4 pb-4 border-t border-slate-100 dark:border-white/5 pt-4 space-y-3">
                        {[['currentPassword', isVi ? 'Mật khẩu hiện tại' : 'Current Password'], ['newPassword', isVi ? 'Mật khẩu mới' : 'New Password'], ['confirmPassword', isVi ? 'Xác nhận mật khẩu mới' : 'Confirm New Password']].map(([key, label]) => (
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
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={handleChangePassword}
                            disabled={pwLoading || !pwData.currentPassword || !pwData.newPassword}
                            className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50"
                          >
                            {pwLoading ? (isVi ? 'Đang lưu...' : 'Saving...') : (isVi ? 'Đổi mật khẩu' : 'Change Password')}
                          </button>
                          {pwMessage && <span className={`text-xs font-medium ${pwMessage.includes('thành công') || pwMessage.includes('successfully') ? 'text-emerald-500' : 'text-red-500'}`}>{pwMessage}</span>}
                        </div>
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
        </div>
      </div>
    </main>
  )
}
