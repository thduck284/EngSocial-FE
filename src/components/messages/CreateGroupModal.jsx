import { useState, useEffect, useRef } from 'react'
import { conversationService, friendsService, uploadService } from '../../services'

/** Tối đa số người được thêm khi tạo nhóm (giới hạn thành viên nhóm nằm ở setting nhóm, làm sau) */
const CREATE_GROUP_MAX_SELECT = 20
const AVATAR_MAX_SIZE = 5 * 1024 * 1024 // 5MB
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export function CreateGroupModal({ t, open, onClose, onSuccess }) {
  const [groupName, setGroupName] = useState('')
  const [groupAvatarFile, setGroupAvatarFile] = useState(null)
  const [groupAvatarPreview, setGroupAvatarPreview] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [error, setError] = useState(null)
  const [existingConversationId, setExistingConversationId] = useState(null)
  const avatarInputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setGroupName('')
    setGroupAvatarFile(null)
    setGroupAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })
    setSelectedIds(new Set())
    setError(null)
    setExistingConversationId(null)
    setLoading(true)
    friendsService
      .getList({ limit: 100 })
      .then((res) => {
        const raw = res?.data?.data ?? res?.data ?? []
        const list = Array.isArray(raw) ? raw : []
        // API trả về { user: { id, name, avatar, ... }, friendshipId } → chuẩn hóa thành { id, name, avatar }
        const normalized = list.map((item) => {
          const u = item?.user ?? item
          const id = u?.id ?? u?._id
          return { id, _id: id, name: u?.name ?? 'User', avatar: u?.avatar ?? null }
        }).filter((f) => f.id)
        setFriends(normalized)
      })
      .catch(() => setFriends([]))
      .finally(() => setLoading(false))
  }, [open])

  const toggleMember = (id) => {
    const sid = String(id)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(sid)) next.delete(sid)
      else if (next.size < CREATE_GROUP_MAX_SELECT) next.add(sid)
      return next
    })
  }
  const selectedCount = selectedIds.size
  const atLimit = selectedCount >= CREATE_GROUP_MAX_SELECT

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!AVATAR_TYPES.includes(file.type)) {
      setError(t('messages.groupAvatarInvalidType'))
      return
    }
    if (file.size > AVATAR_MAX_SIZE) {
      setError(t('messages.groupAvatarTooLarge'))
      return
    }
    setError(null)
    setGroupAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setGroupAvatarFile(file)
    e.target.value = ''
  }

  const handleRemoveAvatar = () => {
    setGroupAvatarFile(null)
    setGroupAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })
  }

  const handleSubmit = async () => {
    const ids = [...selectedIds]
    if (ids.length < 2) {
      setError(t('messages.groupNeedTwoMembers'))
      return
    }
    setError(null)
    setSubmitLoading(true)
    let avatarUrl = null
    try {
      if (groupAvatarFile) {
        setAvatarUploading(true)
        const data = await uploadService.uploadMedia(groupAvatarFile)
        avatarUrl = data?.url ?? null
        setAvatarUploading(false)
      }
      const res = await conversationService.createGroup(groupName.trim() || null, ids, avatarUrl)
      const data = res?.data ?? res
      const conversationId = data?.conversationId ?? data?.id
      if (conversationId) onSuccess(conversationId)
      else onClose()
    } catch (err) {
      const res = err?.response
      const data = res?.data
      const msg = data?.message ?? err?.message ?? t('common.error')
      setError(typeof msg === 'string' ? msg : t('common.error'))
      if (res?.status === 409 && data?.data?.existingConversationId) {
        setExistingConversationId(data.data.existingConversationId)
      } else {
        setExistingConversationId(null)
      }
    } finally {
      setSubmitLoading(false)
      setAvatarUploading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1e2630] rounded-2xl shadow-2xl w-full max-w-md border border-white/5 flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('messages.createGroup')}</h3>
        </div>
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400 w-full">{t('messages.groupAvatar')}</p>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-slate-200 dark:border-border-dark hover:border-primary/50 bg-white dark:bg-card-dark flex items-center justify-center group"
            >
              {groupAvatarPreview ? (
                <img src={groupAvatarPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-gray-500 group-hover:text-primary">add_photo_alternate</span>
              )}
              {avatarUploading && (
                <span className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="material-symbols-outlined animate-spin text-2xl text-slate-900 dark:text-white">progress_activity</span>
                </span>
              )}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="text-xs font-medium text-primary hover:underline"
              >
                {groupAvatarPreview ? t('messages.changeGroupAvatar') : t('messages.chooseGroupAvatar')}
              </button>
              {groupAvatarPreview && (
                <button type="button" onClick={handleRemoveAvatar} disabled={avatarUploading} className="text-xs font-medium text-red-400 hover:underline">
                  {t('messages.removeGroupAvatar')}
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1">{t('messages.groupNamePlaceholder')}</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t('messages.groupNamePlaceholder')}
              className="w-full bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl py-2.5 px-4 text-sm text-slate-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mb-2">{t('messages.selectMembers')}</p>
            {loading ? (
              <div className="flex justify-center py-8 text-slate-400 dark:text-gray-500">
                <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
              </div>
            ) : friends.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-gray-500 py-4">{t('messages.noFriendsForGroup')}</p>
            ) : (
              <>
                <p className="text-xs text-slate-400 dark:text-gray-500 mb-2">
                  {t('messages.membersSelected', { count: selectedCount, max: CREATE_GROUP_MAX_SELECT })}
                </p>
                <ul className="space-y-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-border-dark bg-card-dark/50 p-2">
                  {friends.map((friend) => {
                    const id = friend.id ?? friend._id
                    const sid = String(id)
                    const checked = selectedIds.has(sid)
                    const disabled = !checked && atLimit
                    return (
                      <li key={sid}>
                        <label className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleMember(id)}
                            className="rounded border-gray-500 text-primary focus:ring-primary"
                          />
                        <img
                          src={friend.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name || '')}&background=13b6ec&color=fff`}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm text-gray-200 truncate">{friend.name || 'User'}</span>
                      </label>
                    </li>
                    )
                  })}
                </ul>
              </>
            )}
          </div>
          {error && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-red-400">{error}</p>
              {existingConversationId && (
                <button
                  type="button"
                  onClick={() => onSuccess(existingConversationId)}
                  className="text-sm font-medium text-primary hover:underline text-left"
                >
                  {t('messages.openExistingGroup')}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="p-5 border-t border-white/5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 text-slate-900 dark:text-white hover:bg-white/20 text-sm font-medium"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitLoading || (friends.length > 0 && selectedIds.size < 2)}
            className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
          >
            {submitLoading && <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>}
            {t('messages.createGroupBtn')}
          </button>
        </div>
      </div>
    </div>
  )
}
