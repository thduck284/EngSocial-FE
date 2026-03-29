import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lessonsService } from '../services'
import { ROUTES } from '../constants'
import { SKILL_TABS_LESSONS, TOPIC_OPTIONS, LEVEL_ORDER, SKILL_ORDER } from '../constants/lessons'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const LEVEL_KEYS = { A1: 'levelA1', A2: 'levelA2', B1: 'levelB1', B2: 'levelB2', C1: 'levelC1', C2: 'levelC2' }

const PAGE_SIZE = 10

const selectClass =
  'w-full bg-background-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-shadow appearance-none cursor-pointer bg-[length:1rem] bg-[right_0.65rem_center] bg-no-repeat pr-9'

/** @typedef {'title' | 'skill' | 'level' | 'topic'} SortColumn */

function SortableTh({ columnKey, label, activeKey, sortDir, onSort, align, t }) {
  const active = activeKey === columnKey
  const icon = active ? (sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'
  return (
    <th
      className={`px-4 py-3 text-gray-400 text-xs uppercase tracking-wide ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
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

/**
 * @param {{ mode: 'lesson' | 'practice' }} props
 */
export function ManageLessonsListPage({ mode }) {
  const { t } = useTranslation()
  const { userId } = useParams()
  const isPractice = mode === 'practice'
  const category = isPractice ? 'practice' : 'lesson'
  const basePath = isPractice ? ROUTES.MANAGE_SKILLS(userId) : ROUTES.MANAGE_LESSONS(userId)
  const newPath = `${basePath}/new`

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const [skillFilter, setSkillFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [topicFilter, setTopicFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [sortKey, setSortKey] = useState('title')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const load = useCallback(() => {
    setError('')
    setLoading(true)
    const params = { category, status: 'all', page: 1, limit: 200 }
    if (skillFilter !== 'all') params.skill = skillFilter
    if (levelFilter !== 'all') params.level = levelFilter
    if (topicFilter !== 'all') params.topic = topicFilter

    lessonsService
      .getLessons(params)
      .then((res) => {
        const data = res?.data
        setRows(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        setRows([])
        setError(t('manageLessons.listLoadError'))
      })
      .finally(() => setLoading(false))
  }, [category, skillFilter, levelFilter, topicFilter, t])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [skillFilter, levelFilter, topicFilter, searchQuery, rows])

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => {
      const hay = [r.title, r.slug, r.topic, r.description, r.skill, r.level]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [rows, searchQuery])

  const sortedRows = useMemo(() => {
    const list = [...filteredRows]
    const mul = sortDir === 'asc' ? 1 : -1
    const rankLevel = (lv) => LEVEL_ORDER[lv] ?? 99
    const rankSkill = (s) => SKILL_ORDER[s] ?? 99
    const tieTitle = (a, b) =>
      String(a.title ?? '')
        .toLowerCase()
        .localeCompare(String(b.title ?? '').toLowerCase(), undefined, { sensitivity: 'base' })

    list.sort((a, b) => {
      if (sortKey === 'level') {
        const c = rankLevel(a.level) - rankLevel(b.level)
        if (c !== 0) return c * mul
        return tieTitle(a, b) * mul
      }
      if (sortKey === 'skill') {
        const c = rankSkill(a.skill) - rankSkill(b.skill)
        if (c !== 0) return c * mul
        return tieTitle(a, b) * mul
      }
      const va = String(a[sortKey] ?? '').toLowerCase()
      const vb = String(b[sortKey] ?? '').toLowerCase()
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
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const hasActiveFilters =
    skillFilter !== 'all' || levelFilter !== 'all' || topicFilter !== 'all' || searchQuery.trim() !== ''

  const clearFilters = () => {
    setSkillFilter('all')
    setLevelFilter('all')
    setTopicFilter('all')
    setSearchQuery('')
  }

  const onDelete = async (row) => {
    const id = row?.id ?? row?._id
    if (!id) return
    if (!window.confirm(t('lessons.confirmDeleteLesson', { title: row.title || id }))) return
    setDeletingId(String(id))
    try {
      await lessonsService.delete(id)
      load()
    } catch {
      /* optional toast */
    } finally {
      setDeletingId(null)
    }
  }

  const title = isPractice ? t('manageLessons.listTitlePractice') : t('manageLessons.listTitleLessons')
  const addLabel = isPractice ? t('manageLessons.addPracticeBtn') : t('manageLessons.addLessonBtn')

  const emptyMessage =
    !loading && rows.length > 0 && filteredRows.length === 0
      ? t('manageLessons.listNoMatches')
      : t('manageLessons.listEmpty')

  const shown = filteredRows.length
  const total = rows.length

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">{title}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {isPractice ? t('manageLessons.skillsLabel') : t('manageLessons.lessonsLabel')}
          </p>
        </div>
        <Link
          to={newPath}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-background-dark font-semibold text-xs hover:opacity-90 transition-opacity shadow-md shadow-primary/15 shrink-0 min-h-0"
        >
          <span className="material-symbols-outlined text-[18px] leading-none">add_circle</span>
          {addLabel}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('manageLessons.filterSkill')}</label>
            <div className="relative">
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className={selectClass}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                }}
              >
                {SKILL_TABS_LESSONS.map(({ key, label }) => (
                  <option key={key} value={key}>
                    {t(label)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('manageLessons.filterLevel')}</label>
            <div className="relative">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className={selectClass}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                }}
              >
                <option value="all">{t('skills.all')}</option>
                {LEVELS.map((lv) => (
                  <option key={lv} value={lv}>
                    {lv} — {t(`manageLessons.${LEVEL_KEYS[lv]}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('lessons.filterTopic')}</label>
            <div className="relative">
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className={selectClass}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                }}
              >
                {TOPIC_OPTIONS.map(({ key, label }) => (
                  <option key={key} value={key}>
                    {t(label)}
                  </option>
                ))}
              </select>
            </div>
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
                <SortableTh
                  columnKey="title"
                  label={t('manageLessons.title')}
                  activeKey={sortKey}
                  sortDir={sortDir}
                  onSort={onSortColumn}
                  t={t}
                />
                <SortableTh
                  columnKey="skill"
                  label={t('manageLessons.skill')}
                  activeKey={sortKey}
                  sortDir={sortDir}
                  onSort={onSortColumn}
                  t={t}
                />
                <SortableTh
                  columnKey="level"
                  label={t('manageLessons.level')}
                  activeKey={sortKey}
                  sortDir={sortDir}
                  onSort={onSortColumn}
                  t={t}
                />
                <SortableTh
                  columnKey="topic"
                  label={t('manageLessons.topic')}
                  activeKey={sortKey}
                  sortDir={sortDir}
                  onSort={onSortColumn}
                  t={t}
                />
                <th className="px-4 py-3 text-gray-400 text-xs uppercase tracking-wide text-right font-semibold">
                  {t('manageLessons.colActions')}
                </th>
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
                      <td className="px-4 py-3 text-white font-medium max-w-[240px]">
                        <span className="line-clamp-2">{row.title || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 capitalize">{row.skill || '—'}</td>
                      <td className="px-4 py-3 text-gray-300">{row.level || '—'}</td>
                      <td className="px-4 py-3 text-gray-300 max-w-[180px]">
                        <span className="line-clamp-2 text-sm">{row.topic || '—'}</span>
                      </td>
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
              <span className="text-xs text-gray-500 mr-1">
                {t('manageLessons.paginationPage', { current: safePage, total: totalPages })}
              </span>
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
    </div>
  )
}
