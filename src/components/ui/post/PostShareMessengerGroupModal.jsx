import { DEFAULT_AVATAR } from '../../../constants/ui'

export function PostShareMessengerGroupModal({
  open,
  t,
  messengerGroupSearch,
  setMessengerGroupSearch,
  messengerGroupsLoading,
  messengerGroups,
  friendsForShare,
  messengerModalMode,
  selectedFriendIds,
  setSelectedFriendIds,
  selectedGroupIds,
  setSelectedGroupIds,
  onClose,
  onSend,
}) {
  if (!open) return null

  const keyword = messengerGroupSearch.trim().toLowerCase()
  const groupsFiltered = messengerGroups.filter((g) => {
    if (!keyword) return true
    const name = g?.name || ''
    return name.toLowerCase().includes(keyword)
  })
  const friendsFiltered = friendsForShare.filter((item) => {
    const u = item?.user || item
    if (!u) return false
    if (!keyword) return true
    const name = u?.name || ''
    return name.toLowerCase().includes(keyword)
  })

  const showFriendsSection = messengerModalMode === 'both'
  const friendList = showFriendsSection ? friendsFiltered.slice(0, 5) : []
  const groupList = groupsFiltered.slice(0, 5)

  return (
    <div className="fixed inset-0 z-[10060] flex items-center justify-center bg-black/55 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-card-dark text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-border-dark shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-border-dark">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t('dashboard.shareMessengerSection') || 'Send via Messenger'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="px-4 pt-3 pb-4 space-y-3">
          <div>
            <input
              type="text"
              value={messengerGroupSearch}
              onChange={(e) => setMessengerGroupSearch(e.target.value)}
              placeholder={(() => {
                const raw = t('dashboard.searchGroupsPlaceholder')
                return !raw || raw === 'dashboard.searchGroupsPlaceholder'
                  ? 'Tim kiem ban be / group de gui...'
                  : raw
              })()}
              className="w-full rounded-lg bg-slate-50 dark:bg-background-dark/70 border border-slate-200 dark:border-border-dark px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {messengerGroupsLoading ? (
            <div className="flex items-center justify-center py-6 text-sm text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined animate-spin text-[20px] mr-2">
                progress_activity
              </span>
              {t('dashboard.loading') || 'Dang tai...'}
            </div>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {friendList.length === 0 && groupList.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                  {t('dashboard.noStudyGroups') || 'Khong co ket qua phu hop.'}
                </p>
              ) : (
                <>
                  {friendList.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {t('dashboard.friends') || 'Friends'}
                      </p>
                      {friendList.map((item) => {
                        const u = item?.user || item
                        const name = u?.name || 'User'
                        const id = u?.id ?? u?._id
                        const avatar =
                          u?.avatar ||
                          (name
                            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                name
                              )}&background=13b6ec&color=fff`
                            : DEFAULT_AVATAR)
                        const isSelected =
                          id != null && selectedFriendIds.has(String(id))
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              if (id == null) return
                              setSelectedFriendIds((prev) => {
                                const next = new Set(prev)
                                const key = String(id)
                                if (next.has(key)) next.delete(key)
                                else next.add(key)
                                return next
                              })
                            }}
                            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors ${
                              isSelected
                                ? 'bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark'
                                : 'hover:bg-slate-50 dark:hover:bg-white/10'
                            }`}
                          >
                            <img
                              src={avatar}
                              alt={name}
                              className="w-9 h-9 rounded-full object-cover bg-slate-100 dark:bg-background-dark"
                            />
                            <p className="text-sm font-medium truncate text-slate-900 dark:text-slate-100">{name}</p>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {groupList.length > 0 && (
                    <div className="space-y-1 mt-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {t('dashboard.studyGroups') || 'Groups'}
                      </p>
                      {groupList.map((g) => {
                        const name = g?.name || 'Group'
                        const id = g?.id ?? g?._id
                        const avatar =
                          g?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            name
                          )}&background=13b6ec&color=fff`
                        const isSelected =
                          id != null && selectedGroupIds.has(String(id))
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              if (id == null) return
                              setSelectedGroupIds((prev) => {
                                const next = new Set(prev)
                                const key = String(id)
                                if (next.has(key)) next.delete(key)
                                else next.add(key)
                                return next
                              })
                            }}
                            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors ${
                              isSelected
                                ? 'bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark'
                                : 'hover:bg-slate-50 dark:hover:bg-white/10'
                            }`}
                          >
                            <img
                              src={avatar}
                              alt={name}
                              className="w-9 h-9 rounded-full object-cover bg-slate-100 dark:bg-background-dark"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate text-slate-900 dark:text-slate-100">
                                {name}
                              </p>
                              {g.memberCount != null && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {g.memberCount} {t('dashboard.members') || 'thanh vien'}
                                </p>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-background-dark/70 border border-slate-200 dark:border-border-dark hover:bg-slate-200 dark:hover:bg-background-dark"
            >
              {t('buttons.cancel') || 'Huy'}
            </button>
            <button
              type="button"
              disabled={selectedFriendIds.size === 0 && selectedGroupIds.size === 0}
              onClick={onSend}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {t('messages.send') || 'Gui'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
