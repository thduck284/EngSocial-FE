import { Link } from 'react-router-dom'
import { DEFAULT_AVATAR } from '../../constants/ui'
import { ROUTES } from '../../constants'
import { isTranslationKey } from '../../utils/search'

export function SearchResultsFriends({
  t,
  loading,
  error,
  friendsResult,
  handleSendFriendRequest,
  handleCancelFriendRequest,
}) {
  if (loading) {
    return (
      <div className="bg-card-dark rounded-xl p-8 flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
        <p className="text-sm text-gray-400">{t('search.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card-dark rounded-xl p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-red-400">error</span>
        <p className="text-sm text-gray-400 mt-2">{isTranslationKey(error) ? t(error) : error}</p>
      </div>
    )
  }

  if (friendsResult.length === 0) {
    return (
      <div className="bg-card-dark rounded-xl p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-gray-500">person_search</span>
        <p className="text-sm text-gray-400 mt-2">{t('search.noFriends')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {friendsResult.map((user) => (
        <div
          key={user.id}
          className="bg-card-dark rounded-xl p-4 border border-border-dark flex items-center justify-between gap-4"
        >
          <Link to={ROUTES.PROFILE_USER(user.id)} className="flex items-center gap-3 min-w-0 flex-1">
            <img
              src={user.avatar || DEFAULT_AVATAR}
              alt=""
              className="size-12 rounded-full object-cover bg-slate-700 shrink-0"
            />
            <div className="min-w-0">
              <p className="font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400">
                Level {user.level ?? 1} · {user.totalXp ?? 0} XP
              </p>
            </div>
          </Link>
          <div className="shrink-0">
            {user.friendStatus === 'connected' && (
              <span className="text-xs font-medium text-primary px-3 py-1.5 rounded-full bg-primary/20">
                {t('search.friendAdded')}
              </span>
            )}
            {user.friendStatus === 'pending' && user.pendingSentByMe && user.friendshipId && (
              <button
                type="button"
                onClick={() => handleCancelFriendRequest(user.friendshipId)}
                className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-full transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined text-lg">person_remove</span>
                {t('search.cancelRequest')}
              </button>
            )}
            {user.friendStatus === 'pending' && !user.pendingSentByMe && (
              <span className="text-xs font-medium text-gray-400 px-3 py-1.5 rounded-full bg-gray-500/20">
                {t('search.pendingRequest')}
              </span>
            )}
            {user.friendStatus === 'none' && (
              <button
                type="button"
                onClick={() => handleSendFriendRequest(user.id)}
                className="flex items-center gap-1.5 text-primary hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined text-lg">person_add</span>
                {t('search.addFriend')}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
