import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { questsService } from '../services'
import { ROUTES } from '../constants'
import { AlertModal } from '../components/ui/common/AlertModal'

const PAGE_SIZE = 10

const selectClass =
  'w-full bg-background-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-shadow appearance-none cursor-pointer bg-[length:1rem] bg-[right_0.65rem_center] bg-no-repeat pr-9'

const selectChevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`

/** @typedef {'title' | 'type' | 'xpReward' | 'status'} SortColumn */

function SortableTh({ columnKey, label, activeKey, sortDir, onSort, align, t }) {
  const active = activeKey === columnKey
  const icon = active ? (sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'
  return (
    <th className={`px-4 py-3 text-gray-400 text-xs uppercase tracking-wide ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        title={t('manageLessons.sortToggle')}
        className={`inline-flex items-center gap-1 font-semibold hover:text-primary transition-colors ${align === 'right' ? 'ml-auto flex-row-reverse' : ''}`}
      >
        <span>{label}</span>
        <span className={`material-symbols-outlined text-base ${active ? 'text-primary' : 'text-gray-600'}`}>{icon}</span>
      </button>
    </th>
  )
}

const TYPE_ORDER = { one_time: 0, daily: 1, weekly: 2, monthly: 3, special: 4 }

function typeLabel(t, type) {
  const key = {
    one_time: 'manageQuests.typeOneTime',
    daily: 'manageQuests.typeDaily',
    weekly: 'manageQuests.typeWeekly',
    monthly: 'quests.monthly',
    special: 'quests.oneTime',
  }[type]
  return key ? t(key) : type || '—'
}

export function ManageQuestsListPage() {
  const { t } = useTranslation()
  const { userId } = useParams()
  const basePath = ROUTES.MANAGE_QUESTS(userId)
  const newPath = `${basePath}/new`

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [sortKey, setSortKey] = useState('title')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [itemToDelete, setItemToDelete] = useState(null)

  const load = useCallback(() => {
    setError('')
    setLoading(true)
    questsService
      .getQuests({ status: 'all', limit: 500 })
      .then((res) => {
        const data = res?.data
        setRows(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        setRows([])
        setError(t('manageQuests.listLoadError'))
      })
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [typeFilter, statusFilter, searchQuery, rows])

  const filteredRows = useMemo(() => {
    let list = rows
    if (typeFilter !== 'all') list = list.filter((r) => (r.type || '') === typeFilter)
    if (statusFilter !== 'all') list = list.filter((r) => (r.status || 'active') === statusFilter)
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter((r) => {
        const hay = [r.title, r.description, r.type, r.status].filter(Boolean).join(' ').toLowerCase()
        return hay.includes(q)
      })
    }
    return list
  }, [rows, typeFilter, statusFilter, searchQuery])

  const sortedRows = useMemo(() => {
    const list = [...filteredRows]
    const mul = sortDir === 'asc' ? 1 : -1
    const rankType = (ty) => TYPE_ORDER[ty] ?? 99
    const tieTitle = (a, b) =>
      String(a.title ?? '')
        .toLowerCase()
        .localeCompare(String(b.title ?? '').toLowerCase(), undefined, { sensitivity: 'base' })

    list.sort((a, b) => {
      if (sortKey === 'type') {
        const c = rankType(a.type) - rankType(b.type)
        if (c !== 0) return c * mul
        return tieTitle(a, b) * mul
      }
      if (sortKey === 'xpReward') {
        const c = (Number(a.xpReward) || 0) - (Number(b.xpReward) || 0)
        if (c !== 0) return c * mul
        return tieTitle(a, b) * mul
      }
      if (sortKey === 'status') {
        const c = String(a.status || '').localeCompare(String(b.status || ''), undefined, { sensitivity: 'base' })
        if (c !== 0) return c * mul
        return tieTitle(a, b) * mul
      }
      const va = String(a.title ?? '').toLowerCase()
      const vb = String(b.title ?? '').toLowerCase()
      const c = va.localeCompare(vb, undefined, { sensitivity: 'base' })
      return c * mul
    })
    return list
  }, [filteredRows, sortKey, sortDir])

  const totalSorted = sortedRows.length
  const totalPages = Math.max(1, Math.ceil(totalSorted / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return sortedRows.slice(start, start + PAGE_SIZE)
  }, [sortedRows, safePage])

  const rangeFrom = totalSorted === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeTo = Math.min(safePage * PAGE_SIZE, totalSorted)

  const onSortColumn = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const hasActiveFilters = typeFilter !== 'all' || statusFilter !== 'all' || searchQuery.trim() !== ''

  const clearFilters = () => {
    setTypeFilter('all')
    setStatusFilter('all')
    setSearchQuery('')
  }

  const onDelete = (row) => {
    setItemToDelete(row)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? itemToDelete._id
    setDeletingId(String(id))
    const oldItem = itemToDelete
    setItemToDelete(null)
    try {
      await questsService.delete(id)
      load()
    } catch {
      setItemToDelete(oldItem)
    } finally {
      setDeletingId(null)
    }
  }

  const shown = filteredRows.length
  const total = rows.length

  const emptyMessage =
    !loading && rows.length > 0 && filteredRows.length === 0
      ? t('manageQuests.listNoMatches')
      : t('manageQuests.listEmpty')

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">{t('manageQuests.listTitle')}</h1>
          <p className="text-xs text-gray-500 mt-1">{t('manageQuests.listSubtitle')}</p>
        </div>
        <Link
          to={newPath}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-background-dark font-semibold text-xs hover:opacity-90 transition-opacity shadow-md shadow-primary/15 shrink-0 min-h-0"
        >
          <span className="material-symbols-outlined text-[18px] leading-none">add_circle</span>
          {t('manageQuests.addQuestBtn')}
        </Link>
      </div>

      <div className="rounded-xl border border-border-dark bg-card-dark/80 backdrop-blur-sm p-4 md:p-5 mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3 pb-4 mb-4 border-b border-border-dark">
          <div className="flex items-center gap-2 text-white">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary shrink-0">
              <span className="material-symbols-outlined text-[22px]">tune</span>
            </span>
            <div>
              <p className="text-sm font-bold">{t('manageLessons.filtersHeading')}</p>
              {!loading && total > 0 ? (
                <p className="text-[11px] text-gray-500 mt-0.5">{t('manageLessons.listResultCount', { shown, total })}</p>
              ) : null}
            </div>
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-1.5 self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold text-primary border border-primary/35 bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
              {t('manageLessons.clearFilters')}
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('manageQuests.filterType')}</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={selectClass}
              style={{ backgroundImage: selectChevron }}
            >
              <option value="all">{t('manageWordScramble.all')}</option>
              <option value="one_time">{t('manageQuests.typeOneTime')}</option>
              <option value="daily">{t('manageQuests.typeDaily')}</option>
              <option value="weekly">{t('manageQuests.typeWeekly')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('manageQuests.filterStatus')}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={selectClass}
              style={{ backgroundImage: selectChevron }}
            >
              <option value="all">{t('manageWordScramble.all')}</option>
              <option value="active">{t('manageQuests.statusActive')}</option>
              <option value="archived">{t('manageQuests.statusArchived')}</option>
            </select>
          </div>
        </div>

        <div className="mt-3 md:mt-4">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('manageLessons.filterSearch')}</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('manageLessons.filterSearchPlaceholder')}
              className="w-full bg-background-dark border border-border-dark rounded-xl pl-11 pr-10 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-shadow"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 hover:bg-white/10 hover:text-white transition-colors"
                aria-label={t('common.cancel')}
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            ) : null}
          </div>
          <p className="text-[10px] text-gray-600 mt-1.5">{t('manageLessons.filterSearchHint')}</p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      ) : null}

      <div className="rounded-xl border border-border-dark bg-card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-border-dark">
                <SortableTh columnKey="title" label={t('manageQuests.title')} activeKey={sortKey} sortDir={sortDir} onSort={onSortColumn} t={t} />
                <SortableTh columnKey="type" label={t('manageQuests.type')} activeKey={sortKey} sortDir={sortDir} onSort={onSortColumn} t={t} />
                <SortableTh
                  columnKey="xpReward"
                  label={t('manageQuests.xpReward')}
                  activeKey={sortKey}
                  sortDir={sortDir}
                  onSort={onSortColumn}
                  align="right"
                  t={t}
                />
                <SortableTh columnKey="status" label={t('manageQuests.status')} activeKey={sortKey} sortDir={sortDir} onSort={onSortColumn} t={t} />
                <th className="px-4 py-3 text-gray-400 text-xs uppercase tracking-wide text-right font-semibold">{t('manageLessons.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-gray-500">
                    <span className="material-symbols-outlined animate-spin text-3xl text-primary inline-block align-middle">progress_activity</span>
                  </td>
                </tr>
              ) : totalSorted === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                pagedRows.map((row) => {
                  const id = row?.id ?? row?._id
                  const editPath = `${basePath}/${id}`
                  return (
                    <tr key={id} className="border-b border-border-dark/80 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white font-medium max-w-[260px]">
                        <span className="line-clamp-2">{row.title || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs">{typeLabel(t, row.type)}</td>
                      <td className="px-4 py-3 text-right text-amber-400/90 font-semibold tabular-nums">{row.xpReward ?? 0}</td>
                      <td className="px-4 py-3 text-gray-300 capitalize text-xs">{row.status || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            to={editPath}
                            className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-primary transition-colors"
                            title={t('quests.edit')}
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => onDelete(row)}
                            disabled={deletingId === String(id)}
                            className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50"
                            title={t('manageLessons.delete')}
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalSorted > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-border-dark bg-background-dark/40">
            <p className="text-xs text-gray-500">
              <span className="text-gray-400 font-medium">{t('manageLessons.paginationRange', { from: rangeFrom, to: rangeTo, total: totalSorted })}</span>
              <span className="mx-2 text-border-dark">·</span>
              <span>{t('manageLessons.perPage', { n: PAGE_SIZE })}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 mr-1">{t('manageLessons.paginationPage', { current: safePage, total: totalPages })}</span>
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-border-dark text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
                {t('manageLessons.pagePrev')}
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-border-dark text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                {t('manageLessons.pageNext')}
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <AlertModal
        open={!!itemToDelete}
        title={t('manageQuests.deleteConfirmTitle') || t('quests.delete')}
        message={t('quests.confirmDelete', { title: itemToDelete?.title || '' })}
        confirmText={t('common.confirm') || 'OK'}
        cancelText={t('common.cancel') || 'Cancel'}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
