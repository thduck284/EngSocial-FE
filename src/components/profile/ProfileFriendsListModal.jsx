import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_AVATAR } from '../../constants/ui'
import { ROUTES } from '../../constants'
import { getFriendActivityLabel } from '../../utils/profile'

export function ProfileFriendsListModal({
  t,
  show,
  onClose,
  friends,
  loading,
  onlineUserIds,
  navigate,
  /** Khi true (modal bạn bè của user khác): hiện nút kết bạn nếu người đó chưa là bạn của mình */
  showStrangerAddFriend = false,
  viewerUserId = null,
  myConnectedFriendIds = null,
  myPendingSentUserIds = null,
  onSendFriendRequest,
}) {
  const [search, setSearch] = useState('')
  const [addingFriendId, setAddingFriendId] = useState(null)

  useEffect(() => {
    if (!show) setSearch('')
  }, [show])

  useEffect(() => {
    if (!show) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show, onClose])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return friends
    return friends.filter((f) => f.name && String(f.name).toLowerCase().includes(q))
  }, [friends, search])

  const viewerIdStr = viewerUserId != null ? String(viewerUserId) : null

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark shadow-xl w-full max-w-lg max-h-[min(85vh,640px)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-friends-modal-title"
      >
        <div className="flex items-start justify-between gap-3 p-5 pb-3 border-b border-slate-200 dark:border-border-dark shrink-0">
          <h2 id="profile-friends-modal-title" className="text-lg font-bold dark:text-white pr-2">
            {t('profile.friends', { count: friends.length })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 dark:text-slate-400 shrink-0"
            aria-label={t('buttons.close')}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="px-5 pt-4 shrink-0">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-slate-200"
              placeholder={t('profile.searchFriends')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-5 pt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">
                progress_activity
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
              {friends.length === 0 ? t('profile.noFriends') : t('dashboard.noFriendMatch')}
            </p>
          ) : (
            <ul className="space-y-1">
              {filtered.map((friend, idx) => {
                const friendId = friend.id != null ? String(friend.id) : null
                const isOnline = Boolean(
                  friendId && onlineUserIds && onlineUserIds.has(friendId),
                )
                const isSelf = Boolean(viewerIdStr && friendId && friendId === viewerIdStr)
                const isMyFriend =
                  showStrangerAddFriend &&
                  myConnectedFriendIds &&
                  friendId &&
                  myConnectedFriendIds.has(friendId)
                const isPendingSent =
                  showStrangerAddFriend &&
                  myPendingSentUserIds &&
                  friendId &&
                  myPendingSentUserIds.has(friendId)
                const socialGraphReady =
                  !showStrangerAddFriend ||
                  (myConnectedFriendIds != null && myPendingSentUserIds != null)
                const showAddStranger =
                  socialGraphReady &&
                  showStrangerAddFriend &&
                  typeof onSendFriendRequest === 'function' &&
                  friendId &&
                  !isSelf &&
                  !isMyFriend &&
                  !isPendingSent

                return (
                  <li
                    key={friend.id != null ? String(friend.id) : `friend-${idx}`}
                    className="flex items-center justify-between gap-2 rounded-xl px-2 py-2 hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <Link
                      to={friend.id ? ROUTES.PROFILE_USER(friend.id) : '#'}
                      onClick={onClose}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      <div className="relative shrink-0">
                        <img
                          alt=""
                          className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700 object-cover"
                          src={friend.avatar || DEFAULT_AVATAR}
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-card-dark rounded-full ${
                            isOnline ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'
                          }`}
                        />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-semibold dark:text-slate-200 truncate">{friend.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {getFriendActivityLabel(friend, isOnline, t)}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-1 shrink-0">
                      {showAddStranger && (
                        <button
                          type="button"
                          disabled={addingFriendId === friend.id}
                          onClick={async () => {
                            setAddingFriendId(friend.id)
                            try {
                              await onSendFriendRequest(friend.id)
                            } finally {
                              setAddingFriendId(null)
                            }
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary disabled:opacity-50"
                          title={t('userProfile.addFriend')}
                        >
                          {addingFriendId === friend.id ? (
                            <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined text-xl">person_add</span>
                          )}
                        </button>
                      )}
                      {showStrangerAddFriend && isPendingSent && !isMyFriend && (
                        <span
                          className="px-2 py-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap"
                          title={t('userProfile.pendingRequest')}
                        >
                          {t('userProfile.pendingRequest')}
                        </span>
                      )}
                      {friend.id && typeof navigate === 'function' && (isMyFriend || !showStrangerAddFriend) && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose()
                            navigate(
                              `${ROUTES.MESSAGES}?with=${encodeURIComponent(friend.id)}`,
                              {
                                state: {
                                  withUser: {
                                    id: friend.id,
                                    name: friend.name,
                                    avatar: friend.avatar,
                                  },
                                },
                              },
                            )
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary shrink-0"
                          title={t('messages.title')}
                        >
                          <span className="material-symbols-outlined text-xl">chat_bubble</span>
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
