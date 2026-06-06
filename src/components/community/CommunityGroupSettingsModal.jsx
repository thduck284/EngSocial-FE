import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { groupService } from '../../services/group.service'
import { uploadService } from '../../services/upload.service'
import { showEngSuccessToast } from '../../utils/showEngToast'

function groupTypeToForm(activeGroup) {
  const ty = activeGroup?.type
  if (ty === 'invite_only') return { contentVisibility: 'public', searchable: false }
  return { contentVisibility: ty === 'private' ? 'private' : 'public', searchable: true }
}

function formToGroupType(contentVisibility, searchable) {
  if (!searchable) return 'invite_only'
  return contentVisibility === 'private' ? 'private' : 'public'
}

const fieldClass =
  'w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors'

const labelClass = 'block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5'

export function CommunityGroupSettingsModal({ open, onClose, activeGroup, onSaved }) {
  const { t } = useTranslation()
  const groupId = activeGroup?.id ?? activeGroup?._id
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [contentVisibility, setContentVisibility] = useState('public')
  const [searchable, setSearchable] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !activeGroup) return
    const f = groupTypeToForm(activeGroup)
    setName(activeGroup.name || '')
    setDescription(activeGroup.description || '')
    setIcon(activeGroup.icon || '')
    setContentVisibility(f.contentVisibility)
    setSearchable(f.searchable)
    setError('')
  }, [open, activeGroup])

  if (!open || !groupId) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError(t('groups.settingsModal.nameRequired'))
      return
    }
    setSaving(true)
    setError('')
    try {
      const type = formToGroupType(contentVisibility, searchable)
      const payload = {
        name: trimmed,
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        type,
      }
      await groupService.update(groupId, payload)
      showEngSuccessToast(t('groups.settingsModal.saveSuccess'))
      await onSaved?.()
      onClose?.()
    } catch (err) {
      setError(
        typeof err?.message === 'string' ? err.message : t('groups.settingsModal.saveFailed')
      )
    } finally {
      setSaving(false)
    }
  }

  const privacyOption = (checked, onChange, title, desc) => (
    <label
      className={`flex items-start gap-3 cursor-pointer rounded-lg border px-3 py-2.5 transition-colors ${
        checked
          ? 'border-primary/40 bg-primary/5'
          : 'border-slate-200 dark:border-border-dark hover:bg-slate-50 dark:hover:bg-background-dark/60'
      }`}
    >
      <input type="radio" name="gvis" checked={checked} onChange={onChange} className="mt-0.5 shrink-0 accent-primary" />
      <span className="min-w-0">
        <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">{title}</span>
        {desc ? (
          <span className="block text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 leading-snug">{desc}</span>
        ) : null}
      </span>
    </label>
  )

  const modal = (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-settings-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[min(90vh,calc(100dvh-2rem))] overflow-hidden rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark shadow-sm flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-border-dark shrink-0">
          <h2 id="group-settings-title" className="text-base font-bold text-slate-900 dark:text-white">
            {t('groups.settingsModal.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="size-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-background-dark disabled:opacity-50 transition-colors"
            aria-label={t('groups.settingsModal.cancel')}
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-5 space-y-4">
            <div>
              <label className={labelClass}>{t('groups.settingsModal.fieldName')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className={fieldClass}
              />
            </div>

            <div>
              <label className={labelClass}>{t('groups.settingsModal.fieldDescription')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
                className={`${fieldClass} resize-none`}
              />
            </div>

            <div>
              <span className={labelClass}>{t('groups.settingsModal.fieldIcon')}</span>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2.5">
                <div className="size-11 rounded-lg overflow-hidden border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark shrink-0">
                  {icon ? (
                    <img src={icon} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-xl">image</span>
                    </div>
                  )}
                </div>
                <label className="text-xs font-bold text-primary cursor-pointer hover:underline">
                  {t('groups.settingsModal.uploadIcon')}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={saving}
                    onChange={async (ev) => {
                      const file = ev.target.files?.[0]
                      if (!file) return
                      try {
                        const data = await uploadService.uploadMedia(file)
                        const url = data?.url
                        if (url) setIcon(String(url))
                      } catch {
                        setError(t('groups.settingsModal.uploadFailed'))
                      } finally {
                        ev.target.value = ''
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <span className={labelClass}>{t('groups.settingsModal.privacyTitle')}</span>
              <div className="flex flex-col gap-2">
                {privacyOption(
                  contentVisibility === 'public' && searchable,
                  () => {
                    setContentVisibility('public')
                    setSearchable(true)
                  },
                  t('groups.sidebar.public'),
                  t('groups.sidebar.publicDesc')
                )}
                {privacyOption(
                  contentVisibility === 'private' && searchable,
                  () => {
                    setContentVisibility('private')
                    setSearchable(true)
                  },
                  t('groups.sidebar.private'),
                  t('groups.sidebar.privateDesc')
                )}
                {privacyOption(
                  !searchable,
                  () => setSearchable(false),
                  t('groups.sidebar.hidden'),
                  t('groupsCreate.privacySearchOff')
                )}
              </div>
            </div>

            {error ? (
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-background-dark/30 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-border-dark hover:bg-slate-100 dark:hover:bg-background-dark disabled:opacity-50 transition-colors"
            >
              {t('groups.settingsModal.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-primary hover:brightness-110 disabled:opacity-50 transition-colors"
            >
              {saving ? t('groups.settingsModal.saving') : t('groups.settingsModal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
