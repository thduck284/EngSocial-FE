import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CommunityGroupSettingsModal } from './CommunityGroupSettingsModal'

function isActiveMember(m) {
  return m?.status === 'active'
}

function isModerator(m) {
  return isActiveMember(m) && (m?.role === 'owner' || m?.role === 'admin')
}

/** Dùng để không render card rỗng trên mobile */
export function shouldShowGroupAboutSettings({
  myGroupMembership,
  isMemberOfActiveGroup,
  onOpenInvite,
  onOpenGroupMembersModal,
}) {
  const memberRecord =
    myGroupMembership && isActiveMember(myGroupMembership) ? myGroupMembership : null
  const showMemberActions =
    isMemberOfActiveGroup && memberRecord && onOpenInvite && onOpenGroupMembersModal
  const canEdit = memberRecord && isModerator(myGroupMembership)
  return Boolean(showMemberActions || canEdit)
}

export function CommunityGroupAboutSettings({
  activeGroup,
  myGroupMembership,
  isMemberOfActiveGroup,
  onOpenInvite,
  onOpenGroupMembersModal,
  onRefreshGroup,
  /** Khi nằm trong card riêng (mobile), bỏ viền trên */
  noTopBorder = false,
}) {
  const { t } = useTranslation()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const memberRecord =
    myGroupMembership && isActiveMember(myGroupMembership) ? myGroupMembership : null
  const showMemberActions =
    isMemberOfActiveGroup && memberRecord && onOpenInvite && onOpenGroupMembersModal
  const canEdit = memberRecord && isModerator(myGroupMembership)

  if (!showMemberActions && !canEdit) return null

  return (
    <>
      <div
        className={
          noTopBorder ? '' : 'border-t border-slate-800 pt-4 mt-4'
        }
      >
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">
          {t('groups.sidebar.settingsTitle', { defaultValue: 'Cài đặt' })}
        </h4>
        <div className="flex flex-col gap-2">
          {showMemberActions ? (
            <>
              <button
                type="button"
                onClick={() => onOpenInvite()}
                className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-sm font-medium text-slate-100 hover:bg-slate-800 hover:border-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg text-primary">person_add</span>
                {t('groups.sidebar.settingsInvite', { defaultValue: 'Mời thành viên' })}
              </button>
              <button
                type="button"
                onClick={() => onOpenGroupMembersModal()}
                className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-sm font-medium text-slate-100 hover:bg-slate-800 hover:border-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg text-slate-400">groups</span>
                {t('groups.sidebar.settingsMembers', { defaultValue: 'Thành viên & quản lý' })}
              </button>
            </>
          ) : null}
          {canEdit ? (
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-sm font-medium text-slate-100 hover:bg-slate-800 hover:border-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined text-lg text-slate-400">settings</span>
              {t('groups.sidebar.settingsEditGroup', { defaultValue: 'Chỉnh sửa thông tin nhóm' })}
            </button>
          ) : null}
        </div>
      </div>

      {canEdit ? (
        <CommunityGroupSettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          activeGroup={activeGroup}
          onSaved={onRefreshGroup}
        />
      ) : null}
    </>
  )
}
