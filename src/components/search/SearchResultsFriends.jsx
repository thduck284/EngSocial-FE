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
      <div className="bg-white dark:bg-card-dark rounded-[2.5rem] p-16 flex flex-col items-center justify-center gap-6 border border-slate-100 dark:border-border-dark shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="size-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('search.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-card-dark rounded-[2.5rem] p-16 text-center border border-slate-100 dark:border-border-dark shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="size-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl text-rose-500">error</span>
        </div>
        <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('common.error')}</p>
        <p className="text-sm font-medium text-slate-400 dark:text-gray-500 mt-2">{isTranslationKey(error) ? t(error) : error}</p>
      </div>
    )
  }

  if (friendsResult.length === 0) {
    return (
      <div className="bg-white dark:bg-card-dark rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200 dark:border-border-dark shadow-inner">
        <div className="size-24 bg-slate-50 dark:bg-background-dark/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 dark:border-white/5 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-gray-700">person_search</span>
        </div>
        <p className="text-sm font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('search.noFriends')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {friendsResult.map((user) => (
        <div
          key={user.id}
          className="bg-white dark:bg-card-dark rounded-[1.5rem] p-4 border border-slate-200 dark:border-border-dark flex items-center justify-between gap-4 shadow-md shadow-slate-200/50 dark:shadow-none hover:border-primary/40 transition-all hover:-translate-y-0.5 group"
        >
          <Link to={ROUTES.PROFILE_USER(user.id)} className="flex items-center gap-4 min-w-0 flex-1">
            <div className="relative shrink-0">
               <img
                src={user.avatar || DEFAULT_AVATAR}
                alt=""
                className="size-14 rounded-[1rem] object-cover bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-card-dark shadow-md transition-transform group-hover:scale-105"
              />
              <div className="absolute -bottom-0.5 -right-0.5 size-4 bg-emerald-500 rounded-full border-2 border-white dark:border-card-dark shadow-sm" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-black text-slate-900 dark:text-white truncate tracking-tight group-hover:text-primary transition-colors">{user.name}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-lg">Level {user.level ?? 1}</span>
                <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{user.totalXp ?? 0} XP</span>
              </div>
            </div>
          </Link>
          <div className="shrink-0">
            {user.friendStatus === 'connected' && (
              <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                <span className="material-symbols-outlined text-base">how_to_reg</span>
                {t('search.friendAdded')}
              </div>
            )}
            {user.friendStatus === 'pending' && user.pendingSentByMe && user.friendshipId && (
              <button
                type="button"
                onClick={() => handleCancelFriendRequest(user.friendshipId)}
                className="flex items-center gap-2 text-[9px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-rose-500/10 border border-slate-100 dark:border-white/10 hover:border-rose-500/20 transition-all active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">person_remove</span>
                {t('search.cancelRequest')}
              </button>
            )}
            {user.friendStatus === 'pending' && !user.pendingSentByMe && (
              <div className="flex items-center gap-2 text-[9px] font-black text-amber-500 uppercase tracking-widest px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-sm">
                <span className="material-symbols-outlined text-base">hourglass_empty</span>
                {t('search.pendingRequest')}
              </div>
            )}
            {user.friendStatus === 'none' && (
              <button
                type="button"
                onClick={() => handleSendFriendRequest(user.id)}
                className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest px-5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-white border border-primary/20 transition-all active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                {t('search.addFriend')}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>

  )
}
