import { useTranslation } from 'react-i18next'
import { CommunityGroupAboutSettings } from './CommunityGroupAboutSettings'

export function CommunityRightSidebar({
  activeGroup,
  myGroupMembership,
  isMemberOfActiveGroup = false,
  onOpenInvite,
  onOpenGroupMembersModal,
  onRefreshGroup,
}) {
  const { t } = useTranslation()

  return (
    <aside className="hidden lg:block lg:col-span-3 space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <h3 className="font-bold mb-4 text-base">{t('groups.sidebar.about')}</h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          {activeGroup?.description || t('groups.sidebar.aboutEmpty')}
        </p>
        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-400 text-lg">public</span>
            <div>
              <p className="font-semibold text-slate-100">
                {activeGroup?.type === 'private'
                  ? t('groups.sidebar.private')
                  : activeGroup?.type === 'invite_only'
                    ? t('groups.sidebar.hidden')
                    : t('groups.sidebar.public')}
              </p>
              <p className="text-slate-400 text-xs">
                {activeGroup?.type === 'private'
                  ? t('groups.sidebar.privateDesc')
                  : activeGroup?.type === 'invite_only'
                    ? t('groups.sidebar.hiddenDesc')
                    : t('groups.sidebar.publicDesc')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
            <div>
              <p className="font-semibold text-slate-100">
                {t('groups.sidebar.searchVisibility')}
              </p>
              <p className="text-slate-400 text-xs">
                {activeGroup?.type === 'invite_only'
                  ? t('groupsCreate.privacySearchOff', {
                      defaultValue: 'Không thể tìm thấy nhóm.',
                    })
                  : t('groupsCreate.privacySearchOn', {
                      defaultValue: 'Có thể tìm thấy nhóm.',
                    })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-400 text-lg">group</span>
            <div>
              <p className="font-semibold text-slate-100">
                {activeGroup?.memberCount ?? 0}{' '}
                {t('groups.header.members', { defaultValue: 'thành viên' })}
              </p>
            </div>
          </div>
        </div>

        <CommunityGroupAboutSettings
          activeGroup={activeGroup}
          myGroupMembership={myGroupMembership}
          isMemberOfActiveGroup={isMemberOfActiveGroup}
          onOpenInvite={onOpenInvite}
          onOpenGroupMembersModal={onOpenGroupMembersModal}
          onRefreshGroup={onRefreshGroup}
        />
      </div>
    </aside>
  )
}

