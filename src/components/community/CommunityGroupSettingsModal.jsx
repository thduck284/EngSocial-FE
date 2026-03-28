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
      setError(t('groups.settingsModal.nameRequired', { defaultValue: 'Vui lòng nhập tên nhóm.' }))
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
      showEngSuccessToast(t('groups.settingsModal.saveSuccess', { defaultValue: 'Đã lưu thông tin nhóm.' }))
      await onSaved?.()
      onClose?.()
    } catch (err) {
      setError(
        typeof err?.message === 'string'
          ? err.message
          : t('groups.settingsModal.saveFailed', { defaultValue: 'Không lưu được. Thử lại sau.' })
      )
    } finally {
      setSaving(false)
    }
  }

  const modal = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-settings-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 id="group-settings-title" className="text-lg font-bold text-slate-100">
            {t('groups.settingsModal.title', { defaultValue: 'Chỉnh sửa nhóm' })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              {t('groups.settingsModal.fieldName', { defaultValue: 'Tên nhóm' })}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              {t('groups.settingsModal.fieldDescription', { defaultValue: 'Mô tả' })}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 resize-none focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-300 mb-2">
              {t('groups.settingsModal.fieldIcon', { defaultValue: 'Ảnh nhóm' })}
            </span>
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5">
              <div className="size-12 rounded-xl overflow-hidden border border-slate-800 bg-slate-800 shrink-0">
                {icon ? (
                  <img src={icon} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <span className="material-symbols-outlined">image</span>
                  </div>
                )}
              </div>
              <label className="text-xs font-semibold text-primary cursor-pointer">
                {t('groups.settingsModal.uploadIcon', { defaultValue: 'Tải ảnh' })}
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
                      setError(t('groups.settingsModal.uploadFailed', { defaultValue: 'Tải ảnh thất bại.' }))
                    } finally {
                      ev.target.value = ''
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-medium text-slate-300">
              {t('groups.settingsModal.privacyTitle', { defaultValue: 'Quyền riêng tư' })}
            </span>
            <div className="flex flex-col gap-2 text-sm text-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gvis"
                  checked={contentVisibility === 'public' && searchable}
                  onChange={() => {
                    setContentVisibility('public')
                    setSearchable(true)
                  }}
                />
                {t('groups.sidebar.public')}
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gvis"
                  checked={contentVisibility === 'private' && searchable}
                  onChange={() => {
                    setContentVisibility('private')
                    setSearchable(true)
                  }}
                />
                {t('groups.sidebar.private')}
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gvis"
                  checked={!searchable}
                  onChange={() => setSearchable(false)}
                />
                {t('groups.sidebar.hidden')} — {t('groupsCreate.privacySearchOff', { defaultValue: 'Ẩn khỏi tìm kiếm' })}
              </label>
            </div>
          </div>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-50"
            >
              {t('groups.settingsModal.cancel', { defaultValue: 'Hủy' })}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary border border-primary/50 hover:opacity-90 disabled:opacity-50"
            >
              {saving
                ? t('groups.settingsModal.saving', { defaultValue: 'Đang lưu...' })
                : t('groups.settingsModal.save', { defaultValue: 'Lưu' })}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
