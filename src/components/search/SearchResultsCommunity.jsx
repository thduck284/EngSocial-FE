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
      <div className="rounded-xl border border-border-dark bg-card-dark p-8 text-center">
        <p className="text-sm text-gray-400">{t('search.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border-dark bg-card-dark p-8 text-center">
        <p className="text-sm text-rose-400">{t('search.groupsSearchError')}</p>
      </div>
    )
  }

  if (!q) {
    return (
      <div className="rounded-xl border border-border-dark bg-card-dark p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-gray-500">search</span>
        <p className="text-sm text-gray-400 mt-2">
          {emptyHintNoQuery || t('search.groupsNeedQuery')}
        </p>
      </div>
    )
  }

  if (!Array.isArray(groups) || groups.length === 0) {
    return (
      <div className="rounded-xl border border-border-dark bg-card-dark p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-gray-500">groups</span>
        <p className="text-sm text-gray-400 mt-2">{t('search.noCommunities')}</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {groups.map((g) => {
        const id = g?.id ?? g?._id
        if (!id) return null
        return (
          <li key={String(id)}>
            <Link
              to={`/community/group/${id}/about`}
              className="flex gap-4 p-4 rounded-xl border border-border-dark bg-card-dark hover:border-primary/40 hover:bg-card-dark/80 transition-colors text-left"
            >
              <div className="size-14 rounded-xl overflow-hidden border border-border-dark shrink-0 bg-slate-800">
                {g.icon ? (
                  <img src={g.icon} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/40 to-indigo-600/50">
                    <span className="material-symbols-outlined text-2xl text-white/90">groups</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white truncate">{g.name || t('groups.header.placeholder')}</p>
                <p className="text-xs text-primary mt-0.5">{groupTypeLabel(g, t)}</p>
                {g.description ? (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{g.description}</p>
                ) : null}
                <p className="text-xs text-gray-500 mt-2">
                  {g.memberCount ?? 0}{' '}
                  {t('groups.header.members', { defaultValue: 'thành viên' })}
                </p>
              </div>
              <span className="material-symbols-outlined text-gray-500 shrink-0 self-center">chevron_right</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
