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
      <div className={noTopBorder ? '' : 'border-t border-slate-100 dark:border-border-dark pt-4 mt-4'}>
        <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">
          {t('groups.sidebar.settingsTitle')}
        </h4>
        <div className="flex flex-col gap-1.5">
          {showMemberActions ? (
            <>
              <button
                type="button"
                onClick={() => onOpenInvite()}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-primary">person_add</span>
                {t('groups.sidebar.settingsInvite')}
              </button>
              <button
                type="button"
                onClick={() => onOpenGroupMembersModal()}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-slate-400">groups</span>
                {t('groups.sidebar.settingsMembers')}
              </button>
            </>
          ) : null}
          {canEdit ? (
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-base text-slate-400">settings</span>
              {t('groups.sidebar.settingsEditGroup')}
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
