import { DashboardPostCard } from '../dashboard/DashboardPostCard'

export function SearchResultsPosts({
  t,
  posts,
  postsCount,
  query,
  error,
  loading = false,
}) {
  return (
    <div className="space-y-6">
      {loading && (
        <div className="bg-white dark:bg-card-dark rounded-[2.5rem] p-16 flex flex-col items-center justify-center gap-6 border border-slate-100 dark:border-border-dark shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="size-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('search.loading')}</p>
        </div>
      )}
      {!loading && error && (
        <div className="bg-white dark:bg-card-dark rounded-[2.5rem] p-16 text-center border border-slate-100 dark:border-border-dark shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="size-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-rose-500">error</span>
          </div>
          <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('common.error')}</p>
          <p className="text-sm font-medium text-slate-400 dark:text-gray-500 mt-2">
            {error === 'search.loadError' ? t('search.friendSearchError') : error}
          </p>
        </div>
      )}
      {!loading && !error && posts.length === 0 && (
        <div className="bg-white dark:bg-card-dark rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200 dark:border-border-dark shadow-inner">
          <div className="size-24 bg-slate-50 dark:bg-background-dark/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 dark:border-white/5 shadow-sm">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-gray-700">post_add</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">
            {t('search.loadMorePosts') || 'No posts matching your criteria.'}
          </p>
        </div>
      )}
      {!loading &&
        !error &&
        posts.map((post) => (
          <DashboardPostCard
            key={post.id ?? post._id}
            post={post}
            onToggleLike={() => {}}
          />
        ))}
    </div>

  )
}
