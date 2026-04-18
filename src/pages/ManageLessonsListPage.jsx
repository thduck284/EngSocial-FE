import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lessonsService, mockTestService } from '../services'
import { ROUTES } from '../constants'
import { AlertModal } from '../components/ui/common/AlertModal'
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
 * @param {{ mode: 'lesson' | 'practice' | 'mock-test' }} props
 */
export function ManageLessonsListPage({ mode }) {
  const { t } = useTranslation()
  const { userId } = useParams()
  const isPractice = mode === 'practice'
  const isMockTest = mode === 'mock-test'
  const category = isMockTest ? 'mock_test' : (isPractice ? 'practice' : 'lesson')
  const basePath = isMockTest 
    ? ROUTES.MANAGE_MOCK_TESTS(userId) 
    : (isPractice ? ROUTES.MANAGE_SKILLS(userId) : ROUTES.MANAGE_LESSONS(userId))
  const newPath = `${basePath}/new`

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [selectedLessonForResults, setSelectedLessonForResults] = useState(null)
  const [userResults, setUserResults] = useState([])
  const [userResultsLoading, setUserResultsLoading] = useState(false)
  const [gradingUser, setGradingUser] = useState(null)
  const [gradeScore, setGradeScore] = useState('')
  const [gradeFeedback, setGradeFeedback] = useState('')
  const [gradingSubmitting, setGradingSubmitting] = useState(false)
  const [gradingAiLoading, setGradingAiLoading] = useState(false)

  const [skillFilter, setSkillFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [topicFilter, setTopicFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [sortKey, setSortKey] = useState('title')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [itemToDelete, setItemToDelete] = useState(null)

  const load = useCallback(() => {
    setError('')
    setLoading(true)
    
    if (isMockTest && userId) {
      mockTestService.getUserResults(userId, { page: 1, limit: 100 })
        .then(res => {
          setRows(Array.isArray(res?.data) ? res.data : [])
        })
        .catch(() => setError(t('manageLessons.listLoadError')))
        .finally(() => setLoading(false))
      return
    }

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
  }, [category, skillFilter, levelFilter, topicFilter, t, isMockTest, userId])

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
      await lessonsService.delete(id)
      load()
    } catch {
      setItemToDelete(oldItem)
    } finally {
      setDeletingId(null)
    }
  }

  const onViewResults = async (row) => {
    const id = row?.id ?? row?._id
    if (!id) return
    setSelectedLessonForResults(row)
    setUserResultsLoading(true)
    setUserResults([])
    try {
      const [res, lessonRes] = await Promise.all([
        lessonsService.getAllResults(id),
        lessonsService.getById(id).catch(() => null)
      ])
      if (lessonRes?.data) {
        setSelectedLessonForResults(lessonRes.data)
      }
      setUserResults(res?.data || [])
    } catch (err) {
      console.error('Cant load results', err)
    } finally {
      setUserResultsLoading(false)
    }
  }

  const onStartGrading = async (result) => {
    setGradingUser(result)
    setGradeScore(result.submission?.score ?? result.submission?.aiScore ?? '')
    setGradeFeedback(result.submission?.feedback ?? result.submission?.aiFeedback ?? '')

    // Fetch full lesson detail to get the prompt (mock test rows only have minimal lesson info)
    const lessonId = result.lessonId || result.lesson?.lessonId || result.lesson?.id
    if (lessonId && !result.lesson?.content?.prompt) {
      try {
        const lessonRes = await lessonsService.getById(lessonId)
        if (lessonRes?.data) {
          setGradingUser(prev => ({
            ...prev,
            lesson: { ...prev.lesson, ...lessonRes.data }
          }))
        }
      } catch (err) {
        console.error('Failed to load lesson detail for grading modal:', err)
      }
    }
  }

  const onUseAIResult = () => {
    if (!gradingUser?.submission) return
    setGradeScore(gradingUser.submission.aiScore ?? '')
    setGradeFeedback(gradingUser.submission.aiFeedback ?? '')
  }

  const handleGradeWithAi = async () => {
    if (!selectedLessonForResults || !gradingUser) return
    const lessonId = gradingUser.lessonId || selectedLessonForResults.id || selectedLessonForResults._id
    const userId = gradingUser.user.id || gradingUser.user._id

    setGradingAiLoading(true)
    try {
      const res = await lessonsService.aiGradeWriting(lessonId, userId)
      const updatedProgress = res?.data
      if (updatedProgress?.submission) {
        setGradingUser(prev => ({
          ...prev,
          submission: updatedProgress.submission
        }))
        setGradeScore(updatedProgress.submission.aiScore || '')
        setGradeFeedback(updatedProgress.submission.aiFeedback || '')
      }
    } catch (err) {
      console.error('AI Grading failed', err)
    } finally {
      setGradingAiLoading(false)
    }
  }

  const onSubmitGrade = async () => {
    if (!selectedLessonForResults || !gradingUser) return
    const lessonId = gradingUser.lessonId || selectedLessonForResults.id || selectedLessonForResults._id
    const userId = gradingUser.user.id
    
    setGradingSubmitting(true)
    try {
      await lessonsService.gradeWriting(lessonId, userId, {
        score: Number(gradeScore),
        feedback: gradeFeedback
      })
      if (selectedLessonForResults.isMockTestSuite) {
        // Update the specific row in the modal in-place
        setUserResults(prev => prev.map(r => {
          const rLessonId = r.lessonId || r.lesson?.lessonId
          if (String(rLessonId) === String(lessonId)) {
            return {
              ...r,
              status: 'completed',
              score: Number(gradeScore),
              maxScore: r.maxScore || 100,
              submission: {
                ...r.submission,
                score: Number(gradeScore),
                feedback: gradeFeedback
              }
            }
          }
          return r
        }))
        load() // Also refresh main table so overall status updates
      } else {
        onViewResults(selectedLessonForResults)
      }
      setGradingUser(null)
    } catch (err) {
      console.error('Grading failed', err)
    } finally {
      setGradingSubmitting(false)
    }
  }

  const title = isMockTest 
    ? t('manageLessons.mockTestHistoryTitle')
    : (isPractice ? t('manageLessons.listTitlePractice') : t('manageLessons.listTitleLessons'))
    
  const addLabel = isMockTest
    ? null // No adding results manually
    : (isPractice ? t('manageLessons.addPracticeBtn') : t('manageLessons.addLessonBtn'))

  const filterLabel = isMockTest
    ? t('manageLessons.mockTestHistoryLabel')
    : (isPractice ? t('manageLessons.skillsLabel') : t('manageLessons.lessonsLabel'))

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
            {filterLabel}
          </p>
        </div>
        {!isMockTest && (
          <Link
            to={newPath}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-background-dark font-semibold text-xs hover:opacity-90 transition-opacity shadow-md shadow-primary/15 shrink-0 min-h-0"
          >
            <span className="material-symbols-outlined text-[18px] leading-none">add_circle</span>
            {addLabel}
          </Link>
        )}
      </div>

      {!isMockTest && (
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
      )}

      {error ? (
        <div className="mb-4 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      ) : null}

      <div className="rounded-xl border border-border-dark bg-card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-border-dark">
                {isMockTest ? (
                  <>
                    <th className="px-5 py-3 text-gray-400 text-xs uppercase tracking-wide">{t('manageLessons.colTestDate')}</th>
                    <th className="px-5 py-3 text-gray-400 text-xs uppercase tracking-wide">{t('manageLessons.colTestSet')}</th>
                    <th className="px-5 py-3 text-gray-400 text-xs uppercase tracking-wide text-center">{t('manageLessons.colTotalScore')}</th>
                    <th className="px-5 py-3 text-gray-400 text-xs uppercase tracking-wide text-center">{t('manageLessons.colStatus')}</th>
                  </>
                ) : (
                  <>
                    <SortableTh columnKey="title" label={t('manageLessons.title')} activeKey={sortKey} sortDir={sortDir} onSort={onSortColumn} t={t} />
                    <SortableTh columnKey="skill" label={t('manageLessons.skill')} activeKey={sortKey} sortDir={sortDir} onSort={onSortColumn} t={t} />
                    <SortableTh columnKey="level" label={t('manageLessons.level')} activeKey={sortKey} sortDir={sortDir} onSort={onSortColumn} t={t} />
                    <SortableTh columnKey="topic" label={t('manageLessons.topic')} activeKey={sortKey} sortDir={sortDir} onSort={onSortColumn} t={t} />
                  </>
                )}
                <th className="px-4 py-3 text-gray-400 text-xs uppercase tracking-wide text-right font-semibold">
                  {t('manageLessons.colActions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isMockTest ? 5 : 5} className="px-4 py-16 text-center text-gray-500">
                    <span className="material-symbols-outlined animate-spin text-3xl text-primary inline-block align-middle">progress_activity</span>
                  </td>
                </tr>
              ) : totalSorted === 0 ? (
                <tr>
                  <td colSpan={isMockTest ? 5 : 5} className="px-4 py-12 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                pagedRows.map((row) => {
                  const id = row?.id ?? row?._id
                  
                  if (isMockTest) {
                    return (
                      <tr key={id} className="border-b border-border-dark/80 hover:bg-white/[0.02]">
                        <td className="px-5 py-4">
                          <p className="text-white font-medium text-xs">
                            {new Date(row.completedAt || row.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {new Date(row.completedAt || row.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {row.lessons?.map((l, i) => (
                              <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                l.skill === 'writing' ? 'border-amber-500/20 text-amber-400 bg-amber-500/5' : 
                                l.skill === 'reading' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' :
                                'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                              }`}>
                                {l.skill === 'writing' ? 'W' : l.skill === 'reading' ? 'R' : 'L'}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm font-black text-primary">
                            {row.overallScore}/{row.maxTotalScore}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            row.status === 'graded' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
                          }`}>
                            {row.status === 'graded' ? t('manageLessons.statusGraded') : t('manageLessons.statusNotGraded')}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              // We use the lesson results modal but show the mock test's parts
                              // We map lessonResults to the format expected by the modal
                              setSelectedLessonForResults({
                                isMockTestSuite: true,
                                title: `Mock Test - ${new Date(row.createdAt).toLocaleDateString()}`,
                                lessons: row.lessons,
                                userId: row.userId
                              })
                              setUserResults(row.lessonResults.map(r => ({
                                ...r,
                                user: { id: row.userId, name: 'Học viên' }, // Mocking user info for display
                                lesson: row.lessons.find(l => String(l.lessonId) === String(r.lessonId))
                              })))
                            }}
                            className="bg-primary/10 hover:bg-primary text-primary hover:text-background-dark px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                          >
                            {t('manageLessons.viewGradeBtn')}
                          </button>
                        </td>
                      </tr>
                    )
                  }

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
                          <button
                            type="button"
                            onClick={() => onViewResults(row)}
                            className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-emerald-400 transition-colors"
                            title={t('staffDashboard.viewResults')}
                          >
                            <span className="material-symbols-outlined text-lg">group</span>
                          </button>
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

      {/* User Results Modal */}
      {selectedLessonForResults && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card-dark border border-border-dark w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-border-dark flex items-center justify-between bg-background-dark/50">
              <div>
                <h3 className="text-lg font-bold text-white">{t('staffDashboard.userResultsTitle')}</h3>
                <p className="text-[11px] text-primary truncate max-w-[400px]">
                  {selectedLessonForResults.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedLessonForResults(null)}
                className="p-2 rounded-lg text-gray-400 hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-0 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {userResultsLoading ? (
                <div className="py-20 text-center">
                  <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
                </div>
              ) : userResults.length === 0 ? (
                <div className="py-20 text-center text-gray-500 flex flex-col items-center">
                  <span className="material-symbols-outlined text-5xl mb-3 opacity-20">history_edu</span>
                  <p className="text-sm">{t('staffDashboard.noResults')}</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-card-dark border-b border-border-dark">
                    <tr>
                      <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase">
                        {selectedLessonForResults.isMockTestSuite ? t('manageLessons.colPart') : t('staffDashboard.colUser')}
                      </th>
                      <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase text-center">{t('staffDashboard.colScore')}</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase text-right">
                        {selectedLessonForResults.isMockTestSuite ? t('manageLessons.colStatus') : t('staffDashboard.colCompletedAt')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark/50">
                    {userResults.map((res) => (
                      <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3">
                          {selectedLessonForResults.isMockTestSuite ? (
                            <div className="flex items-center gap-2">
                               <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${
                                 res.lesson?.skill === 'writing' ? 'bg-amber-500/10 text-amber-500' :
                                 res.lesson?.skill === 'reading' ? 'bg-blue-500/10 text-blue-500' :
                                 'bg-emerald-500/10 text-emerald-500'
                               }`}>
                                 {res.lesson?.skill?.[0]?.toUpperCase()}
                               </span>
                               <span className="text-xs text-gray-300 truncate max-w-[200px]">{res.lesson?.title}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/20">
                                {res.user.avatar ? (
                                  <img src={res.user.avatar} alt="" className="size-full object-cover" />
                                ) : (
                                  <span className="text-xs font-bold text-primary">{res.user.name?.[0]}</span>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">
                                  {res.user.name} 
                                  {res.attemptNo > 0 && (
                                    <span className="ml-2 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                                      Lần {res.attemptNo}
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10px] text-gray-500">{res.user.email}</p>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {(res.status === 'under_review') ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                              Review
                            </span>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-black ${res.score >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-primary/10 text-primary'}`}>
                              {res.score}/{res.maxScore || 100}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex flex-col items-end">
                            {selectedLessonForResults.isMockTestSuite ? (
                               <span className={`text-[10px] font-bold uppercase ${res.status === 'completed' || res.status === 'graded' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                 {res.status === 'completed' || res.status === 'graded' ? t('manageLessons.statusGraded') : t('manageLessons.statusNotGraded')}
                               </span>
                            ) : (
                               <span className="text-xs text-gray-500 font-medium">
                                {new Date(res.completedAt || res.submission?.submittedAt).toLocaleDateString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit'
                                })}
                              </span>
                            )}
                            
                            {res.lesson?.skill === 'writing' && (
                              <button
                                onClick={() => onStartGrading(res)}
                                className="mt-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter"
                              >
                                {res.status === 'under_review' ? t('staffDashboard.gradeBtn') || 'Grade' : t('staffDashboard.editGradeBtn') || 'Edit Grade'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="p-4 border-t border-border-dark bg-background-dark/50 flex justify-end">
              <button
                onClick={() => setSelectedLessonForResults(null)}
                className="px-5 py-2 rounded-xl border border-border-dark text-gray-400 font-bold text-xs hover:bg-white/5"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {gradingUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-card-dark border border-border-dark w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[95vh] animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Left Hand: Student Submission */}
            <div className="flex-1 p-6 border-r border-border-dark overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 overflow-hidden">
                  {gradingUser.user.avatar ? <img src={gradingUser.user.avatar} className="size-full object-cover" /> : <span className="font-bold text-primary">{gradingUser.user.name?.[0]}</span>}
                </div>
                <div>
                  <h4 className="font-bold text-white">{gradingUser.user.name}</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Bài làm Writing</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-background-dark/50 rounded-xl p-5 border border-border-dark">
                  <h5 className="text-[11px] font-bold text-emerald-500 uppercase mb-3 tracking-wider">Đề Bài (Prompt)</h5>
                  <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-serif">
                    {gradingUser.lesson?.content?.prompt || selectedLessonForResults?.content?.prompt || 'Không có dữ liệu đề bài'}
                  </div>
                </div>

                <div className="bg-background-dark/50 rounded-xl p-5 border border-border-dark">
                  <h5 className="text-[11px] font-bold text-gray-500 uppercase mb-3 tracking-wider">Nội dung bài viết</h5>
                  <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-serif">
                    {gradingUser.submission?.content}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border-dark/30 text-[10px] text-gray-500 flex justify-between">
                    <span>Số từ: {gradingUser.submission?.wordCount}</span>
                    <span>Đã nộp: {new Date(gradingUser.submission?.submittedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-sm text-primary">psychology</span>
                    <span className="text-[11px] font-bold text-primary uppercase">Gợi ý từ AI (Score: {gradingUser.submission?.aiScore}/100)</span>
                  </div>
                  {gradingUser.submission?.aiBreakdown && (
                    <div className="grid grid-cols-2 gap-1.5 mb-3 not-italic">
                      {[
                        { label: 'Task Response', key: 'taskResponse' },
                        { label: 'Coherence', key: 'coherence' },
                        { label: 'Lexical', key: 'lexical' },
                        { label: 'Grammar', key: 'grammar' },
                      ].map(({ label, key }) => {
                        const val = gradingUser.submission.aiBreakdown[key] ?? '—'
                        const pct = typeof val === 'number' ? (val / 25) * 100 : 0
                        return (
                          <div key={key} className="bg-background-dark/60 rounded-lg p-2">
                            <div className="flex justify-between text-[9px] mb-1">
                              <span className="text-gray-500 font-bold uppercase">{label}</span>
                              <span className={`font-black ${pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-primary' : 'text-amber-400'}`}>{val}/25</span>
                            </div>
                            <div className="h-1 bg-border-dark rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-primary' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <p className="text-[11px] text-gray-400 leading-relaxed italic">
                    {gradingUser.submission?.aiFeedback}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Hand: Grading Form */}
            <div className="w-full md:w-[320px] lg:w-[400px] p-6 bg-background-dark/30 flex flex-col">
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">Chấm điểm & Nhận xét</h4>
                  <button
                    onClick={handleGradeWithAi}
                    disabled={gradingAiLoading}
                    className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-sm ${gradingAiLoading ? 'animate-spin' : ''}`}>
                      {gradingAiLoading ? 'progress_activity' : 'psychology'}
                    </span>
                    {gradingAiLoading ? 'ĐANG CHẤM...' : 'CHẤM BẰNG AI'}
                  </button>
                </div>
                {gradingUser.submission?.aiScore && (
                  <button onClick={onUseAIResult} className="text-[10px] font-bold text-gray-500 hover:text-primary flex items-center gap-1 transition-colors self-end">
                    <span className="material-symbols-outlined text-sm">auto_fix</span> Dùng kết quả AI có sẵn
                  </button>
                )}
              </div>

              <div className="space-y-5 flex-1">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Điểm số (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeScore}
                    onChange={(e) => setGradeScore(e.target.value)}
                    className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-lg font-black text-primary focus:ring-2 focus:ring-primary outline-none"
                    placeholder="85"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nhận xét chi tiết</label>
                  <textarea
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    className="w-full flex-1 min-h-[150px] bg-background-dark border border-border-dark rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-primary outline-none resize-none custom-scrollbar"
                    placeholder="Viết nhận xét cho học viên..."
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setGradingUser(null)}
                  className="flex-1 py-3 px-4 border border-border-dark rounded-xl text-gray-400 font-bold text-xs hover:bg-white/5"
                >
                  Hủy
                </button>
                <button
                  onClick={onSubmitGrade}
                  disabled={gradingSubmitting || !gradeScore}
                  className="flex-[2] py-3 px-4 bg-primary text-background-dark rounded-xl font-black text-xs hover:opacity-90 disabled:opacity-50"
                >
                  {gradingSubmitting ? 'ĐANG LƯU...' : 'LƯU KẾT QUẢ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        open={!!itemToDelete}
        title={t('manageLessons.deleteConfirmTitle') || t('quests.delete')}
        message={t('lessons.confirmDeleteLesson', { title: itemToDelete?.title || '' })}
        confirmText={t('common.confirm') || 'OK'}
        cancelText={t('common.cancel') || 'Cancel'}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
