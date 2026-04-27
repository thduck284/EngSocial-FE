import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../services'

function toDateInputValue(v) {
  if (!v) return ''
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function AdminUserDetailModal({ open, userId, currentUserId, onClose, onMutate }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [original, setOriginal] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [address, setAddress] = useState('')
  const [gender, setGender] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [avatar, setAvatar] = useState('')
  const [role, setRole] = useState('user')
  const [status, setStatus] = useState('active')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isSelf = currentUserId != null && userId != null && String(currentUserId) === String(userId)

  const load = useCallback(() => {
    if (!userId) return
    setError('')
    setSuccess('')
    setLoading(true)
    adminService
      .getUserById(userId)
      .then((res) => {
        const u = res?.data?.user ?? res?.data ?? res?.user ?? null
        if (!u) {
          setOriginal(null)
          return
        }
        setOriginal(u)
        setName(u.name || '')
        setEmail(u.email || '')
        setPhone(u.phone || '')
        setBio(u.bio || '')
        setAddress(u.address || '')
        setGender(u.gender || '')
        setDateOfBirth(toDateInputValue(u.dateOfBirth))
        setAvatar(u.avatar || '')
        setRole(u.role || 'user')
        setStatus(u.status || 'active')
      })
      .catch(() => {
        setOriginal(null)
        setError(t('adminConsole.detailLoadError'))
      })
      .finally(() => setLoading(false))
  }, [userId, t])

  useEffect(() => {
    if (!open || !userId) return
    setNewPassword('')
    setConfirmPassword('')
    load()
  }, [open, userId, load])

  const handleSaveProfile = async () => {
    if (!userId || saving) return
    setError('')
    setSuccess('')
    const n = name.trim()
    const em = email.trim()
    if (n.length < 2) {
      setError(t('adminConsole.nameRequired'))
      return
    }
    if (!em) {
      setError(t('adminConsole.emailRequired'))
      return
    }
    setSaving(true)
    try {
      await adminService.updateUser(userId, {
        name: n,
        email: em,
        phone: phone.trim(),
        bio: bio.trim(),
        address: address.trim(),
        gender,
        dateOfBirth: dateOfBirth ? dateOfBirth : null,
        avatar: avatar.trim(),
      })
      if (role !== original?.role) {
        await adminService.updateUserRole(userId, role)
      }
      if (status !== original?.status) {
        await adminService.updateUserStatus(userId, status)
      }
      setSuccess(t('adminConsole.detailSaved'))
      load()
      onMutate?.()
    } catch (err) {
      setError(err?.message || err?.data?.message || t('adminConsole.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleSetPassword = async () => {
    if (!userId || pwSaving) return
    setError('')
    setSuccess('')
    if (newPassword.length < 8) {
      setError(t('adminConsole.passwordTooShort'))
      return
    }
    if (newPassword !== confirmPassword) {
      setError(t('adminConsole.passwordMismatch'))
      return
    }
    setPwSaving(true)
    try {
      await adminService.setUserPassword(userId, newPassword)
      setNewPassword('')
      setConfirmPassword('')
      setSuccess(t('adminConsole.passwordChanged'))
      onMutate?.()
    } catch (err) {
      setError(err?.message || err?.data?.message || t('adminConsole.saveFailed'))
    } finally {
      setPwSaving(false)
    }
  }

  const handleLock = async () => {
    if (!userId || isSelf || saving) return
    setSaving(true)
    setError('')
    try {
      await adminService.updateUserStatus(userId, 'banned')
      setStatus('banned')
      setSuccess(t('adminConsole.userLocked'))
      load()
      onMutate?.()
    } catch {
      setError(t('adminConsole.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleUnlock = async () => {
    if (!userId || saving) return
    setSaving(true)
    setError('')
    try {
      await adminService.updateUserStatus(userId, 'active')
      setStatus('active')
      setSuccess(t('adminConsole.userUnlocked'))
      load()
      onMutate?.()
    } catch {
      setError(t('adminConsole.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!userId || isSelf || deleting) return
    setDeleting(true)
    setError('')
    try {
      await adminService.deleteUser(userId)
      setDeleteConfirmOpen(false)
      onMutate?.()
      onClose?.()
    } catch (err) {
      setError(err?.message || err?.data?.message || t('adminConsole.deleteFailed'))
    } finally {
      setDeleting(false)
    }
  }

  const inputClass =
    'w-full bg-background-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary'

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={() => !saving && !deleting && !pwSaving && onClose?.()}
        role="presentation"
      >
        <div
          className="bg-[#1a222c] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border-dark p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-white pr-4">{t('adminConsole.detailTitle')}</h2>
            <button
              type="button"
              onClick={() => !saving && !deleting && onClose?.()}
              className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
              aria-label={t('common.close')}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400">
              <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
            </div>
          ) : !original ? (
            <p className="text-red-400 text-sm">{error || t('adminConsole.noData')}</p>
          ) : (
            <>
              {error ? <p className="text-red-400 text-sm mb-3">{error}</p> : null}
              {success ? <p className="text-emerald-400 text-sm mb-3">{success}</p> : null}

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('adminConsole.colName')}</label>
                  <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('adminConsole.colEmail')}</label>
                  <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('adminConsole.fieldPhone')}</label>
                  <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('adminConsole.fieldBio')}</label>
                  <textarea className={`${inputClass} min-h-[72px]`} value={bio} onChange={(e) => setBio(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('adminConsole.fieldAddress')}</label>
                  <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('adminConsole.fieldGender')}</label>
                    <select className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="">{t('adminConsole.genderUnset')}</option>
                      <option value="male">{t('adminConsole.genderMale')}</option>
                      <option value="female">{t('adminConsole.genderFemale')}</option>
                      <option value="other">{t('adminConsole.genderOther')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('adminConsole.fieldDob')}</label>
                    <input className={inputClass} type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('adminConsole.fieldAvatar')}</label>
                  <input className={inputClass} value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="URL" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('adminConsole.colRole')}</label>
                    <select
                      className={inputClass}
                      value={role}
                      disabled={isSelf}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="user">{t('adminConsole.roleUser')}</option>
                      <option value="moderator">{t('adminConsole.roleModerator')}</option>
                      <option value="admin">{t('adminConsole.roleAdmin')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('adminConsole.colStatus')}</label>
                    <select
                      className={inputClass}
                      value={status}
                      disabled={isSelf}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="active">{t('adminConsole.statusActive')}</option>
                      <option value="inactive">{t('adminConsole.statusInactive')}</option>
                      <option value="banned">{t('adminConsole.statusBanned')}</option>
                      <option value="pending">{t('adminConsole.statusPending')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveProfile}
                  className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-background-dark hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> : null}
                  {t('adminConsole.saveProfile')}
                </button>
                <button
                  type="button"
                  disabled={saving || isSelf || status === 'banned'}
                  onClick={handleLock}
                  className="rounded-xl border border-amber-500/40 text-amber-400 px-4 py-2.5 text-sm font-semibold hover:bg-amber-500/10 disabled:opacity-40"
                >
                  {t('adminConsole.lockAccount')}
                </button>
                <button
                  type="button"
                  disabled={saving || status !== 'banned'}
                  onClick={handleUnlock}
                  className="rounded-xl border border-emerald-500/40 text-emerald-400 px-4 py-2.5 text-sm font-semibold hover:bg-emerald-500/10 disabled:opacity-40"
                >
                  {t('adminConsole.unlockAccount')}
                </button>
              </div>

              <div className="border-t border-border-dark pt-5 mb-2">
                <h3 className="text-sm font-bold text-white mb-3">{t('adminConsole.changePasswordSection')}</h3>
                <div className="space-y-2 mb-3">
                  <input
                    type="password"
                    autoComplete="new-password"
                    className={inputClass}
                    placeholder={t('adminConsole.newPassword')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    autoComplete="new-password"
                    className={inputClass}
                    placeholder={t('adminConsole.confirmPassword')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  disabled={pwSaving}
                  onClick={handleSetPassword}
                  className="rounded-xl bg-white/10 border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-50"
                >
                  {pwSaving ? <span className="material-symbols-outlined animate-spin align-middle">progress_activity</span> : null}{' '}
                  {t('adminConsole.applyPassword')}
                </button>
              </div>

              {!isSelf ? (
                <div className="border-t border-border-dark pt-5 mt-5">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="rounded-xl border border-red-500/50 text-red-400 px-4 py-2.5 text-sm font-semibold hover:bg-red-500/10"
                  >
                    {t('adminConsole.deleteAccount')}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-4">{t('adminConsole.cannotDeleteSelfHint')}</p>
              )}
            </>
          )}
        </div>
      </div>

      {deleteConfirmOpen ? (
        <div
          className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/70"
          role="presentation"
          onClick={() => !deleting && setDeleteConfirmOpen(false)}
        >
          <div
            className="bg-[#1e2630] rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white text-base font-bold mb-2">{t('adminConsole.deleteConfirmTitle')}</h3>
            <p className="text-gray-200 text-sm mb-6">{t('adminConsole.deleteConfirmMessage')}</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/20 text-white hover:bg-white/5 text-sm"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDelete()}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:opacity-90 text-sm font-medium inline-flex items-center gap-1"
              >
                {deleting ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> : null}
                {t('adminConsole.deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
