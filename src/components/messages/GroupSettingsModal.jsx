import { useState, useEffect } from 'react'
import { conversationService, uploadService } from '../../services'

const MAX_MEMBERS_CAP = 50
const AVATAR_MAX_SIZE = 5 * 1024 * 1024 // 5MB
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const DEFAULT_PERMISSIONS = {
  adminCanKick: true,
  adminCanAddMembers: true,
  adminCanEditGroupInfo: false,
  adminCanAssignUserPermissions: false,
  adminCanBlockUser: true,
  userCanAddMembers: false,
  userCanEditGroupInfo: false,
}

const TAB_INFO = 'info'
const TAB_PERMISSIONS = 'permissions'
const TAB_BLOCK = 'block'

export function GroupSettingsModal({ t, open, onClose, selected, currentUserId, onSuccess }) {
  const [activeTab, setActiveTab] = useState(TAB_INFO)
  const [name, setName] = useState('')
  const [maxMembers, setMaxMembers] = useState(50)
  const [permissions, setPermissions] = useState({ ...DEFAULT_PERMISSIONS })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)
  const [unblockingId, setUnblockingId] = useState(null)
  const [blockSearchQuery, setBlockSearchQuery] = useState('')
  const [error, setError] = useState(null)

  const isHost = selected?.myRole === 'host'
  const canEditInfo = isHost || (selected?.myRole === 'admin' && selected?.groupPermissions?.adminCanEditGroupInfo) || (selected?.myRole === 'user' && selected?.groupPermissions?.userCanEditGroupInfo)
  const canEditMaxMembers = isHost
  const canEditUserPermissions = isHost || (selected?.myRole === 'admin' && selected?.groupPermissions?.adminCanAssignUserPermissions)
  const canBlock = isHost || (selected?.myRole === 'admin' && selected?.groupPermissions?.adminCanBlockUser !== false)
  const canSaveSettings = canEditInfo || isHost || (selected?.myRole === 'admin' && selected?.groupPermissions?.adminCanAssignUserPermissions)
  const memberCount = selected?.memberCount ?? 0
  const blockedMembers = selected?.blockedMembers ?? []
  const membersCanBlock = (selected?.members ?? []).filter(
    (m) => m.userId !== currentUserId && m.role !== 'host'
  )
  const blockSearchLower = (blockSearchQuery || '').trim().toLowerCase()
  const membersCanBlockFiltered = blockSearchLower
    ? membersCanBlock.filter((m) => (m.name || '').toLowerCase().includes(blockSearchLower))
    : membersCanBlock

  useEffect(() => {
    if (!open || !selected) return
    setActiveTab(TAB_INFO)
    setName(selected.name ?? '')
    setMaxMembers(selected.maxMembers ?? MAX_MEMBERS_CAP)
    if (selected.groupPermissions) {
      setPermissions({
        adminCanKick: !!selected.groupPermissions.adminCanKick,
        adminCanAddMembers: !!selected.groupPermissions.adminCanAddMembers,
        adminCanEditGroupInfo: !!selected.groupPermissions.adminCanEditGroupInfo,
        adminCanAssignUserPermissions: !!selected.groupPermissions.adminCanAssignUserPermissions,
        adminCanBlockUser: selected.groupPermissions.adminCanBlockUser !== false,
        userCanAddMembers: !!selected.groupPermissions.userCanAddMembers,
        userCanEditGroupInfo: !!selected.groupPermissions.userCanEditGroupInfo,
      })
    } else {
      setPermissions({ ...DEFAULT_PERMISSIONS })
    }
    setAvatarFile(null)
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })
    setBlockSearchQuery('')
    setError(null)
  }, [open, selected])

  useEffect(() => {
    if (!canBlock && activeTab === TAB_BLOCK) setActiveTab(TAB_INFO)
  }, [canBlock, activeTab])

  const setPerm = (key, value) => {
    setPermissions((prev) => ({ ...prev, [key]: value }))
  }

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
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setAvatarFile(file)
    e.target.value = ''
  }

  const handleSubmit = async () => {
    const conversationId = selected?.id
    if (!conversationId) return
    const maxVal = Math.min(MAX_MEMBERS_CAP, Math.max(memberCount, Number(maxMembers) || memberCount))
    if (maxVal < memberCount) {
      setError(t('messages.maxMembersMustBeAtLeastCurrent', { count: memberCount }))
      return
    }
    setError(null)
    setSubmitLoading(true)
    let avatarUrl = selected?.avatar ?? ''
    try {
      if (avatarFile) {
        setAvatarUploading(true)
        const data = await uploadService.uploadPostMedia(avatarFile)
        avatarUrl = data?.url ?? avatarUrl
        setAvatarUploading(false)
      }
      const payload = {}
      if (canEditInfo) {
        payload.name = name.trim() || selected?.name || ''
        payload.avatar = avatarUrl
      }
      if (canEditMaxMembers) {
        payload.maxMembers = maxVal
      }
      if (isHost) {
        payload.groupPermissions = permissions
      } else if (canEditUserPermissions) {
        payload.groupPermissions = {
          userCanAddMembers: permissions.userCanAddMembers,
          userCanEditGroupInfo: permissions.userCanEditGroupInfo,
        }
      }
      const res = await conversationService.updateGroupSettings(conversationId, payload)
      const data = res?.data ?? res
      onSuccess?.(data)
      onClose()
    } catch (err) {
      const res = err?.response
      const data = res?.data
      const msg = data?.message ?? err?.message ?? t('common.error')
      setError(typeof msg === 'string' ? msg : t('common.error'))
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleBlockUser = async (userId) => {
    if (!selected?.id || !canBlock) return
    setError(null)
    setBlockLoading(true)
    try {
      await conversationService.blockUserInGroup(selected.id, userId)
      onSuccess?.()
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? t('common.error')
      setError(typeof msg === 'string' ? msg : t('common.error'))
    } finally {
      setBlockLoading(false)
    }
  }

  const handleUnblockUser = async (userId) => {
    if (!selected?.id || !canBlock) return
    setError(null)
    setUnblockingId(userId)
    try {
      await conversationService.unblockUserInGroup(selected.id, userId)
      onSuccess?.()
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? t('common.error')
      setError(typeof msg === 'string' ? msg : t('common.error'))
    } finally {
      setUnblockingId(null)
    }
  }

  if (!open) return null

  const tabs = [
    { id: TAB_INFO, label: t('messages.groupSettingsTabInfo') },
    { id: TAB_PERMISSIONS, label: t('messages.groupSettingsTabPermissions') },
    ...(canBlock ? [{ id: TAB_BLOCK, label: t('messages.groupSettingsTabBlock') }] : []),
  ]

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1e2630] rounded-2xl shadow-2xl w-full max-w-2xl border border-white/5 flex flex-col overflow-hidden"
        style={{ minHeight: '420px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">{t('messages.groupSettings')}</h3>
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="w-44 shrink-0 border-r border-border-dark py-2 flex flex-col gap-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-r-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/15 text-primary border-l-2 border-primary'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-5 flex-1 overflow-y-auto min-h-[280px]">
          {activeTab === TAB_INFO && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t('messages.groupName')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => canEditInfo && setName(e.target.value)}
                  placeholder={t('messages.groupNamePlaceholder')}
                  readOnly={!canEditInfo}
                  disabled={!canEditInfo}
                  className={`w-full border rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-500 outline-none ${
                    canEditInfo
                      ? 'bg-card-dark border-border-dark focus:ring-2 focus:ring-primary'
                      : 'bg-white/5 border-border-dark cursor-not-allowed opacity-90'
                  }`}
                />
              </div>
              <div className="flex items-start gap-4">
                <label className="text-xs font-medium text-gray-400 shrink-0">{t('messages.groupAvatar')}</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-border-dark bg-card-dark flex items-center justify-center shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                    ) : selected?.avatar ? (
                      <img src={selected.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-gray-500">add_photo_alternate</span>
                    )}
                    {avatarUploading && (
                      <span className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="material-symbols-outlined animate-spin text-2xl text-white">progress_activity</span>
                      </span>
                    )}
                  </div>
                  {canEditInfo && (
                    <>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        id="group-settings-avatar"
                        onChange={handleAvatarChange}
                      />
                      <label htmlFor="group-settings-avatar" className="text-sm font-medium text-primary hover:underline cursor-pointer">
                        {avatarPreview || avatarFile ? t('messages.changeGroupAvatar') : t('messages.chooseGroupAvatar')}
                      </label>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t('messages.maxMembersLabel')}</label>
                {canEditMaxMembers ? (
                  <>
                    <input
                      type="number"
                      min={memberCount}
                      max={MAX_MEMBERS_CAP}
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(Number(e.target.value) || memberCount)}
                      className="w-full max-w-[140px] bg-card-dark border border-border-dark rounded-xl py-2.5 px-4 text-sm text-white focus:ring-2 focus:ring-primary outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('messages.memberCount', { count: memberCount })} · {t('messages.maxMembersCap', { max: MAX_MEMBERS_CAP })}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-300 py-1">
                    {t('messages.memberCount', { count: memberCount })} · {t('messages.maxMembersCap', { max: selected?.maxMembers ?? MAX_MEMBERS_CAP })}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === TAB_PERMISSIONS && (
            <div className="space-y-4">
              {isHost ? (
                <>
                  <p className="text-xs text-gray-400">{t('messages.permissionsAdminTitle')}</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.adminCanKick}
                        onChange={(e) => setPerm('adminCanKick', e.target.checked)}
                        className="rounded border-gray-500 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-200">{t('messages.permAdminCanKick')}</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.adminCanAddMembers}
                        onChange={(e) => setPerm('adminCanAddMembers', e.target.checked)}
                        className="rounded border-gray-500 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-200">{t('messages.permAdminCanAddMembers')}</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.adminCanEditGroupInfo}
                        onChange={(e) => setPerm('adminCanEditGroupInfo', e.target.checked)}
                        className="rounded border-gray-500 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-200">{t('messages.permAdminCanEditGroupInfo')}</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.adminCanAssignUserPermissions}
                        onChange={(e) => setPerm('adminCanAssignUserPermissions', e.target.checked)}
                        className="rounded border-gray-500 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-200">{t('messages.permAdminCanAssignUserPermissions')}</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.adminCanBlockUser}
                        onChange={(e) => setPerm('adminCanBlockUser', e.target.checked)}
                        className="rounded border-gray-500 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-200">{t('messages.permAdminCanBlockUser')}</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 pt-2">{t('messages.permissionsUserTitle')}</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.userCanAddMembers}
                        onChange={(e) => setPerm('userCanAddMembers', e.target.checked)}
                        className="rounded border-gray-500 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-200">{t('messages.permUserCanAddMembers')}</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.userCanEditGroupInfo}
                        onChange={(e) => setPerm('userCanEditGroupInfo', e.target.checked)}
                        className="rounded border-gray-500 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-200">{t('messages.permUserCanEditGroupInfo')}</span>
                    </label>
                  </div>
                </>
              ) : canEditUserPermissions ? (
                <>
                  <p className="text-xs text-gray-400">{t('messages.permissionsUserTitle')}</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.userCanAddMembers}
                        onChange={(e) => setPerm('userCanAddMembers', e.target.checked)}
                        className="rounded border-gray-500 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-200">{t('messages.permUserCanAddMembers')}</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.userCanEditGroupInfo}
                        onChange={(e) => setPerm('userCanEditGroupInfo', e.target.checked)}
                        className="rounded border-gray-500 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-200">{t('messages.permUserCanEditGroupInfo')}</span>
                    </label>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">{t('messages.noPermissionToEditGroup')}</p>
              )}
            </div>
          )}

          {activeTab === TAB_BLOCK && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">{t('messages.groupSettingsBlockHint')}</p>
              {canBlock && membersCanBlock.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2">{t('messages.groupSettingsSelectMemberToBlock')}</p>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">search</span>
                    <input
                      type="text"
                      value={blockSearchQuery}
                      onChange={(e) => setBlockSearchQuery(e.target.value)}
                      placeholder={t('messages.searchInChat')}
                      className="w-full bg-card-dark border border-border-dark rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto rounded-xl border border-border-dark bg-card-dark/50 p-2">
                    {membersCanBlockFiltered.length === 0 ? (
                      <li className="py-4 text-center text-sm text-gray-500">
                        {blockSearchLower ? t('messages.noSearchResults') : t('messages.groupSettingsBlockedListEmpty')}
                      </li>
                    ) : (
                      membersCanBlockFiltered.map((m) => (
                        <li key={m.userId}>
                          <button
                            type="button"
                            onClick={() => handleBlockUser(m.userId)}
                            disabled={blockLoading}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-left transition-colors disabled:opacity-50"
                          >
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 shrink-0">
                              {m.avatar ? (
                                <img src={m.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="w-full h-full flex items-center justify-center text-sm font-bold text-primary">{(m.name || '?').charAt(0)}</span>
                              )}
                            </div>
                            <span className="text-sm text-gray-200 truncate flex-1">{m.name || 'User'}</span>
                            <span className="material-symbols-outlined text-red-400 text-lg shrink-0">block</span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">{t('messages.groupSettingsTabBlock')}</p>
                {blockedMembers.length === 0 ? (
                  <div className="rounded-xl border border-border-dark bg-card-dark/50 p-6 text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-500 mb-2">block</span>
                    <p className="text-sm text-gray-500">{t('messages.groupSettingsBlockedListEmpty')}</p>
                  </div>
                ) : (
                  <ul className="space-y-1 max-h-48 overflow-y-auto rounded-xl border border-border-dark bg-card-dark/50 p-2">
                    {blockedMembers.map((m) => (
                      <li key={m.userId} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-white/5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 shrink-0">
                            {m.avatar ? (
                              <img src={m.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-sm font-bold text-primary">{(m.name || '?').charAt(0)}</span>
                            )}
                          </div>
                          <span className="text-sm text-gray-200 truncate">{m.name || 'User'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnblockUser(m.userId)}
                          disabled={unblockingId === m.userId}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 disabled:opacity-50"
                        >
                          {unblockingId === m.userId ? (
                            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                          ) : (
                            t('messages.groupSettingsUnblock')
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {!canBlock && (
                <p className="text-sm text-gray-500">{t('messages.noPermissionToEditGroup')}</p>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
          </div>
        </div>

        <div className="p-5 border-t border-white/5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 text-sm font-medium"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitLoading || !canSaveSettings}
            className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
          >
            {submitLoading && <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>}
            {t('messages.saveGroupSettings')}
          </button>
        </div>
      </div>
    </div>
  )
}
