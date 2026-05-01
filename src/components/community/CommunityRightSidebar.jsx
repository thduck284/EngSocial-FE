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
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 shadow-sm">
        <h3 className="font-black mb-6 text-xs uppercase tracking-widest text-slate-400 dark:text-gray-500">{t('groups.sidebar.about')}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
          {activeGroup?.description || t('groups.sidebar.aboutEmpty')}
        </p>
        <div className="space-y-6 text-sm">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">public</span>
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">
                {activeGroup?.type === 'private'
                  ? t('groups.sidebar.private')
                  : activeGroup?.type === 'invite_only'
                    ? t('groups.sidebar.hidden')
                    : t('groups.sidebar.public')}
              </p>
              <p className="text-slate-500 dark:text-gray-400 text-xs font-medium mt-0.5">
                {activeGroup?.type === 'private'
                  ? t('groups.sidebar.privateDesc')
                  : activeGroup?.type === 'invite_only'
                    ? t('groups.sidebar.hiddenDesc')
                    : t('groups.sidebar.publicDesc')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">search</span>
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">
                {t('groups.sidebar.searchVisibility')}
              </p>
              <p className="text-slate-500 dark:text-gray-400 text-xs font-medium mt-0.5">
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
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">group</span>
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">
                {activeGroup?.memberCount ?? 0}{' '}
                {t('groups.header.members', { defaultValue: 'thành viên' })}
              </p>
              <p className="text-slate-500 dark:text-gray-400 text-xs font-medium mt-0.5">
                {t('groups.header.activeNow', { defaultValue: 'Đang hoạt động' })}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
          <CommunityGroupAboutSettings
            activeGroup={activeGroup}
            myGroupMembership={myGroupMembership}
            isMemberOfActiveGroup={isMemberOfActiveGroup}
            onOpenInvite={onOpenInvite}
            onOpenGroupMembersModal={onOpenGroupMembersModal}
            onRefreshGroup={onRefreshGroup}
          />
        </div>
      </div>
    </aside>

  )
}

