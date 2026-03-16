import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants'
import { DEFAULT_AVATAR } from '../../constants/ui'

/**
 * Modal: full list of study groups (API + fallback suggested), scroll when > 5.
 */
export function StudyGroupsModal({ open, onClose, groupConversations, groupConversationsLoading, suggestedGroups }) {
  const { t } = useTranslation()
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white dark:bg-[#111e22] rounded-2xl border border-slate-200 dark:border-[#325a67] shadow-xl w-full max-w-md max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#325a67] shrink-0">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">groups</span>
            {t('dashboard.studyGroups')}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#233f48] dark:hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-4 flex flex-col min-h-[200px]">
          {groupConversationsLoading ? (
            <div className="py-8 flex justify-center">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
            </div>
          ) : (
            <>
              <div className={`space-y-3 overflow-y-auto pr-1 custom-scrollbar ${groupConversations.length > 5 ? 'max-h-[50vh]' : ''}`}>
                {groupConversations.map((c) => {
                  const convId = c.id ?? c._id
                  const name = c.name || t('dashboard.studyGroups')
                  const avatar = c.avatar || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
                  const membersLabel = c.memberCount != null ? `${c.memberCount} ${t('dashboard.members')}` : ''
                  const isGroupOnline = c.online === true
                  return (
                    <Link
                      key={convId}
                      to={ROUTES.MESSAGES_CONVERSATION(convId)}
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-[#325a67] hover:bg-slate-50 dark:hover:bg-[#233f48] transition-colors"
                    >
                      <div className="relative shrink-0">
                        <img src={avatar} alt="" className="size-10 rounded-lg object-cover" />
                        {isGroupOnline && (
                          <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#111e22]" title={t('userProfile.online')} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{name}</p>
                        {membersLabel && <p className="text-xs text-slate-500 dark:text-[#92bbc9]">{membersLabel}</p>}
                      </div>
                      <span className="material-symbols-outlined text-slate-400 text-lg shrink-0" aria-hidden="true">chat_bubble</span>
                    </Link>
                  )
                })}
              </div>
              {groupConversations.length === 0 && suggestedGroups?.length > 0 && (
                <div className="space-y-3">
                  {suggestedGroups.slice(0, 3).map((g, idx) => (
                    <div key={g.title || idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-[#325a67] bg-slate-50/50 dark:bg-[#233f48]/30">
                      <div className={`size-10 rounded-lg ${g.color || 'bg-primary/20'} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-white text-xl">{g.icon || 'groups'}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{g.title}</p>
                        <p className="text-xs text-slate-500 dark:text-[#92bbc9]">{g.members}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {groupConversations.length === 0 && (!suggestedGroups || suggestedGroups.length === 0) && (
                <p className="text-sm text-slate-500 dark:text-[#92bbc9] py-4 text-center">{t('dashboard.noStudyGroups')}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
