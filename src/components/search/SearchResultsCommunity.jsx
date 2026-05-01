import { Link } from 'react-router-dom'

function groupTypeLabel(g, t) {
  const ty = g?.type
  if (ty === 'private') return t('groups.header.private', { defaultValue: 'Riêng tư' })
  if (ty === 'invite_only') return t('groups.header.hidden', { defaultValue: 'Ẩn' })
  return t('groups.header.public', { defaultValue: 'Công khai' })
}

export function SearchResultsCommunity({
  t,
  loading,
  error,
  groups = [],
  query,
  emptyHintNoQuery,
}) {
  const q = (query || '').trim()

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
        <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('search.groupsSearchError')}</p>
        <p className="text-sm font-medium text-slate-400 dark:text-gray-500 mt-2">{error}</p>
      </div>
    )
  }

  if (!q) {
    return (
      <div className="bg-white dark:bg-card-dark rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200 dark:border-border-dark shadow-inner">
        <div className="size-24 bg-slate-50 dark:bg-background-dark/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 dark:border-white/5 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-gray-700">search</span>
        </div>
        <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">
          {emptyHintNoQuery || t('search.groupsNeedQuery')}
        </p>
      </div>
    )
  }

  if (!Array.isArray(groups) || groups.length === 0) {
    return (
      <div className="bg-white dark:bg-card-dark rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200 dark:border-border-dark shadow-inner">
        <div className="size-24 bg-slate-50 dark:bg-background-dark/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 dark:border-white/5 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-gray-700">groups</span>
        </div>
        <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('search.noCommunities')}</p>
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {groups.map((g) => {
        const id = g?.id ?? g?._id
        if (!id) return null
        return (
          <li key={String(id)}>
            <Link
              to={`/community/group/${id}/about`}
              className="flex gap-6 p-6 rounded-[2rem] border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-primary/40 transition-all hover:-translate-y-0.5 group text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
              
              <div className="size-20 rounded-[1.25rem] overflow-hidden border-2 border-white dark:border-card-dark shrink-0 bg-slate-100 dark:bg-slate-800 shadow-lg transition-transform group-hover:scale-105 relative z-10">
                {g.icon ? (
                  <img src={g.icon} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-indigo-600">
                    <span className="material-symbols-outlined text-3xl text-white">groups</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-lg">
                    {groupTypeLabel(g, t)}
                  </span>
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white truncate uppercase tracking-tight group-hover:text-primary transition-colors">{g.name || t('groups.header.placeholder')}</p>
                {g.description ? (
                  <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-2 line-clamp-1 italic">&quot;{g.description}&quot;</p>
                ) : null}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                    <span className="material-symbols-outlined text-base">group</span>
                    {g.memberCount ?? 0} {t('groups.header.members')}
                  </div>
                </div>
              </div>
              <div className="size-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-gray-600 group-hover:bg-primary group-hover:text-white transition-all self-center shadow-inner">
                <span className="material-symbols-outlined text-2xl">chevron_right</span>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>

  )
}
