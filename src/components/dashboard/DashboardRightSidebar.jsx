import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants'
import { DEFAULT_AVATAR } from '../../constants/ui'
import { friendsService } from '../../services'
import { DashboardCard } from './DashboardCard'
import { DashboardSectionHeader } from './DashboardSectionHeader'

/**
 * Right sidebar: friend suggestions (dropdown + list), friends (All/Online).
 */
export function DashboardRightSidebar({
  friendSelectRef,
  friendSelectOpen,
  setFriendSelectOpen,
  friendTab,
  setFriendTab,
  friendTabLoading,
  suggestionsList,
  sentRequestsList,
  receivedRequestsList,
  loadFriendTabData,
  sendSuggestionRequest,
  friendsFilterTab,
  setFriendsFilterTab,
  displayedFriendsList,
  onlineUserIds,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <aside className="col-span-12 lg:col-span-3 space-y-6">
      <DashboardCard className="p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <DashboardSectionHeader
            icon={null}
            title={t('dashboard.friendSuggestions')}
            className="mb-0"
          />
          <div className="relative min-w-0 max-w-[220px]" ref={friendSelectRef}>
            <button
              type="button"
              onClick={() => setFriendSelectOpen((o) => !o)}
              className="w-full flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-[#325a67] bg-slate-50 dark:bg-[#233f48] hover:bg-slate-100 dark:hover:bg-[#2d4a54] px-2.5 py-0.5 text-left transition-colors"
            >
              <span className="material-symbols-outlined text-primary shrink-0 text-lg">
                {friendTab === 'suggestions' ? 'person_add' : friendTab === 'sent' ? 'send' : 'mail'}
              </span>
              <span className="flex-1 text-[11px] font-medium text-slate-700 dark:text-[#92bbc9] truncate">
                {friendTab === 'suggestions' ? t('dashboard.friendSuggestions') : friendTab === 'sent' ? t('dashboard.friendSentRequests') : t('dashboard.friendReceivedRequests')}
              </span>
              <span className={`material-symbols-outlined text-slate-400 dark:text-[#92bbc9] text-base shrink-0 transition-transform ${friendSelectOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            {friendSelectOpen && (
              <div className="absolute right-0 left-0 top-full z-10 mt-1.5 rounded-xl border border-slate-200 dark:border-[#325a67] bg-white dark:bg-[#111e22] shadow-lg py-1 overflow-hidden">
                {[
                  { value: 'suggestions', label: t('dashboard.friendSuggestions'), icon: 'person_add' },
                  { value: 'sent', label: t('dashboard.friendSentRequests'), icon: 'send' },
                  { value: 'received', label: t('dashboard.friendReceivedRequests'), icon: 'mail' },
                ].map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setFriendTab(value); setFriendSelectOpen(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors ${friendTab === value
                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                        : 'text-slate-700 dark:text-[#92bbc9] hover:bg-slate-50 dark:hover:bg-[#233f48]'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={`space-y-4 min-h-[80px] overflow-y-auto pr-1 custom-scrollbar ${
          (friendTab === 'suggestions' && suggestionsList.length > 5) ||
          (friendTab === 'sent' && sentRequestsList.length > 5) ||
          (friendTab === 'received' && receivedRequestsList.length > 5)
            ? 'max-h-[240px]'
            : ''
        }`}>
          {friendTabLoading ? (
            <div className="flex items-center justify-center py-6">
              <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
            </div>
          ) : friendTab === 'suggestions' ? (
            suggestionsList.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-[#92bbc9] py-2">{t('dashboard.noSuggestions')}</p>
            ) : (
              suggestionsList.map((u) => {
                const id = u?.id ?? u?._id
                const name = u?.name || 'User'
                const avatar = u?.avatar || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
                return (
                  <div key={id} className="flex items-center justify-between">
                    <Link to={id ? `/profile/${id}` : '#'} className="flex items-center gap-3 min-w-0">
                      <img src={avatar} alt="" className="size-9 rounded-full object-cover shrink-0" />
                      <div className="text-xs min-w-0">
                        <p className="font-bold truncate">{name}</p>
                        {u.mutualFriendsCount != null && u.mutualFriendsCount > 0 && (
                          <p className="text-[#92bbc9]">{u.mutualFriendsCount} {t('dashboard.mutualFriends')}</p>
                        )}
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => sendSuggestionRequest(id)}
                      className="material-symbols-outlined text-primary hover:bg-primary/10 rounded-full p-1 transition-colors shrink-0"
                      title={t('dashboard.addFriend')}
                    >
                      person_add
                    </button>
                  </div>
                )
              })
            )
          ) : friendTab === 'sent' ? (
            sentRequestsList.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-[#92bbc9] py-2">{t('dashboard.noSentRequests')}</p>
            ) : (
              sentRequestsList.map((r) => {
                const to = r?.to || {}
                const id = to?.id ?? to?._id
                const name = to?.name || 'User'
                const avatar = to?.avatar || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
                return (
                  <div key={r.friendshipId} className="flex items-center justify-between">
                    <Link to={id ? `/profile/${id}` : '#'} className="flex items-center gap-3 min-w-0">
                      <img src={avatar} alt="" className="size-9 rounded-full object-cover shrink-0" />
                      <p className="text-xs font-bold truncate">{name}</p>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        friendsService.cancelRequest(r.friendshipId).then(() => loadFriendTabData('sent'))
                      }}
                      className="text-xs font-medium text-amber-500 hover:bg-amber-500/10 px-2 py-1 rounded transition-colors shrink-0"
                    >
                      {t('userProfile.cancelRequest')}
                    </button>
                  </div>
                )
              })
            )
          ) : (
            receivedRequestsList.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-[#92bbc9] py-2">{t('dashboard.noReceivedRequests')}</p>
            ) : (
              receivedRequestsList.map((r) => {
                const from = r?.from || {}
                const id = from?.id ?? from?._id
                const name = from?.name || 'User'
                const avatar = from?.avatar || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
                return (
                  <div key={r.friendshipId} className="flex items-center justify-between">
                    <Link to={id ? `/profile/${id}` : '#'} className="flex items-center gap-3 min-w-0">
                      <img src={avatar} alt="" className="size-9 rounded-full object-cover shrink-0" />
                      <p className="text-xs font-bold truncate">{name}</p>
                    </Link>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          friendsService.acceptRequest(r.friendshipId).then(() => loadFriendTabData('received'))
                        }}
                        className="material-symbols-outlined text-green-500 hover:bg-green-500/10 rounded-full p-1 transition-colors"
                        title={t('dashboard.acceptRequest')}
                      >
                        check
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          friendsService.cancelRequest(r.friendshipId).then(() => loadFriendTabData('received'))
                        }}
                        className="material-symbols-outlined text-red-400 hover:bg-red-500/10 rounded-full p-1 transition-colors"
                        title={t('userProfile.cancelRequest')}
                      >
                        close
                      </button>
                    </div>
                  </div>
                )
              })
            )
          )}
        </div>
        <Link
          to="/friends"
          className="block w-full mt-4 py-2 text-xs font-bold text-primary hover:underline text-center"
        >
          {t('dashboard.viewAllSuggestions')}
        </Link>
      </DashboardCard>

      <DashboardCard className="p-5">
        <DashboardSectionHeader
          icon="people"
          title={t('dashboard.friends')}
          rightSlot={
            <Link
              to={ROUTES.MESSAGES}
              className="p-1 rounded-lg text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors"
              title={t('messages.title')}
            >
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
            </Link>
          }
          className="mb-3"
        />
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-[#233f48] rounded-lg mb-3">
          <button
            type="button"
            onClick={() => setFriendsFilterTab('all')}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${friendsFilterTab === 'all' ? 'bg-white dark:bg-[#111e22] text-primary shadow-sm' : 'text-slate-500 dark:text-[#92bbc9] hover:text-slate-700 dark:hover:text-white'}`}
          >
            {t('dashboard.all')}
          </button>
          <button
            type="button"
            onClick={() => setFriendsFilterTab('online')}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${friendsFilterTab === 'online' ? 'bg-white dark:bg-[#111e22] text-primary shadow-sm' : 'text-slate-500 dark:text-[#92bbc9] hover:text-slate-700 dark:hover:text-white'}`}
          >
            {t('userProfile.online')}
          </button>
        </div>
        <div
          className={`space-y-3 overflow-y-auto pr-1 custom-scrollbar ${displayedFriendsList.length > 5 ? 'max-h-[200px]' : ''
            }`}
        >
          {displayedFriendsList.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-[#92bbc9]">{t('dashboard.noFriendsOnline')}</p>
          ) : (
            displayedFriendsList.map((item) => {
              const u = item?.user || item
              const id = u?.id ?? u?._id
              const name = u?.name || 'User'
              const avatar = u?.avatar || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
              const isOnline = item.isOnline
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#233f48] transition-colors group"
                >
                  <Link to={id ? `/profile/${id}` : '#'} className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <img src={avatar} alt="" className="size-9 rounded-full object-cover" />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#111e22]" title={t('userProfile.online')} />
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{name}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => navigate(`${ROUTES.MESSAGES}?with=${encodeURIComponent(id)}`, { state: { withUser: { id, name, avatar } } })}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors shrink-0"
                    title={t('messages.title')}
                  >
                    <span className="material-symbols-outlined text-lg">chat_bubble</span>
                  </button>
                </div>
              )
            })
          )}
        </div>
      </DashboardCard>
    </aside>
  )
}
