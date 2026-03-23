import { Link } from 'react-router-dom'
import { DEFAULT_AVATAR } from '../../constants/ui'
import { ROUTES } from '../../constants'
import { getFriendActivityLabel } from '../../utils/profile'

export function ProfileFriendsCard({
  t,
  friends,
  loading,
  friendSearch,
  setFriendSearch,
  onlineUserIds,
  navigate,
}) {
  return (
    <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-border-dark">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold dark:text-white">
          {t('profile.friends', { count: friends.length })}
        </h3>
        <Link
          to={ROUTES.FRIENDS}
          className="text-xs font-semibold text-primary hover:underline"
        >
          {t('buttons.viewAll')}
        </Link>
      </div>
      <div className="relative mb-5">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
          search
        </span>
        <input
          type="text"
          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-slate-200"
          placeholder={t('profile.searchFriends')}
          value={friendSearch}
          onChange={(e) => setFriendSearch(e.target.value)}
        />
      </div>
      <div className="space-y-4 custom-scrollbar max-h-64 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="material-symbols-outlined animate-spin text-2xl text-primary">
              progress_activity
            </span>
          </div>
        ) : friends.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
            {t('profile.noFriends')}
          </p>
        ) : (
          friends.map((friend) => {
            const friendId = friend.id != null ? String(friend.id) : null
            const isOnline = Boolean(
              friendId && onlineUserIds && onlineUserIds.has(friendId),
            )
            return (
              <div
                key={friend.id ?? friend.name ?? ''}
                className="flex items-center justify-between group"
              >
                <Link
                  to={friend.id ? `${ROUTES.PROFILE_USER(friend.id)}` : '#'}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <img
                      alt=""
                      className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 object-cover"
                      src={friend.avatar || DEFAULT_AVATAR}
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-card-dark rounded-full ${
                        isOnline
                          ? 'bg-green-500'
                          : 'bg-gray-400 dark:bg-gray-500'
                      }`}
                      title={
                        isOnline
                          ? t('userProfile.online')
                          : t('profile.offline')
                      }
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold dark:text-slate-200 group-hover:text-primary transition-colors truncate">
                      {friend.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {getFriendActivityLabel(friend, isOnline, t)}
                    </p>
                  </div>
                </Link>
                {friend.id && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `${ROUTES.MESSAGES}?with=${encodeURIComponent(
                          friend.id,
                        )}`,
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
                    }
                    className="p-2 rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors shrink-0"
                    title={t('messages.title')}
                  >
                    <span className="material-symbols-outlined text-xl">
                      chat_bubble
                    </span>
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

