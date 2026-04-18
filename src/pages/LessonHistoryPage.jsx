import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../constants'
import { lessonsService } from '../services'
import { getLessonLink } from '../utils/lesson'

/**
 * Page: Lịch sử làm bài (user's lesson progress history).
 * Lists lessons the user has started or completed with link to resume/view.
 */
export function LessonHistoryPage() {
  const { t } = useTranslation()
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSkill, setFilterSkill] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: 10 }
    if (filterStatus) params.status = filterStatus
    if (filterSkill) params.skill = filterSkill
    if (filterCategory) params.category = filterCategory
    lessonsService
      .getMyProgress(params)
      .then((res) => {
        const list = res?.data ?? []
        const filteredList = Array.isArray(list) ? list.filter(item => !item.isMockTest) : []
        const pag = res?.meta?.pagination ?? null
        setData(filteredList)
        setPagination(pag)
      })
      .catch(() => {
        setData([])
        setPagination(null)
      })
      .finally(() => setLoading(false))
  }, [page, filterStatus, filterSkill, filterCategory])

  const totalPages = pagination?.totalPages ?? 1
  const currentPage = pagination?.currentPage ?? 1

  return (
    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-6 p-6">
      <aside className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-20 lg:self-start">
        <div className="bg-card-dark/60 backdrop-blur-xl rounded-2xl p-6 border border-white/5 shadow-2xl relative overflow-hidden group/sidebar">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover/sidebar:opacity-100 transition-opacity" />
          <h3 className="font-bold text-sm flex items-center gap-3 mb-4 text-white">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg">history</span>
            {t('lessonHistory.title')}
          </h3>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">{t('lessonHistory.subtitle')}</p>
          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-400">{t('lessonHistory.filterStatus')}</label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white focus:ring-primary focus:border-primary"
            >
              <option value="">{t('lessonHistory.statusAll')}</option>
              <option value="completed">{t('lessonHistory.statusCompleted')}</option>
              <option value="under_review">{t('lessonHistory.statusUnderReview')}</option>
              {filterSkill !== 'writing' && (
                <option value="in_progress">{t('lessonHistory.statusInProgress')}</option>
              )}
            </select>
            <label className="block text-xs font-medium text-gray-400">{t('lessonHistory.filterSkill')}</label>
            <select
              value={filterSkill}
              onChange={(e) => { setFilterSkill(e.target.value); setPage(1) }}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white focus:ring-primary focus:border-primary"
            >
              <option value="">{t('skills.all')}</option>
              <option value="reading">{t('skills.reading')}</option>
              <option value="listening">{t('skills.listening')}</option>
              <option value="writing">{t('skills.writing')}</option>
            </select>
            <label className="block text-xs font-medium text-gray-400">{t('lessonHistory.filterCategory')}</label>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1) }}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white focus:ring-primary focus:border-primary"
            >
              <option value="">{t('lessonHistory.categoryAll')}</option>
              <option value="lesson">{t('lessonHistory.categoryLesson')}</option>
              <option value="practice">{t('lessonHistory.categoryPractice')}</option>
            </select>
            <button
              type="button"
              onClick={() => {
                setFilterStatus('')
                setFilterSkill('')
                setFilterCategory('')
                setPage(1)
              }}
              className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              {t('lessonHistory.reset')}
            </button>
          </div>
          <Link
            to={ROUTES.LESSON}
            className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-primary rounded-xl text-xs font-bold border border-white/5 transition-all"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            {t('lessonHistory.backToLessons')}
          </Link>
        </div>
      </aside>

      <section className="col-span-12 lg:col-span-9 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">{t('lessonHistory.title')}</h1>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl bg-card-dark border border-border-dark text-center">
            <span className="material-symbols-outlined text-5xl text-gray-500 mb-4">history_edu</span>
            <p className="text-gray-400 mb-4">{t('lessonHistory.empty')}</p>
            <Link to={ROUTES.LESSON} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-xl text-sm transition-all">
              <span className="material-symbols-outlined">school</span>
              {t('lessonHistory.goToLessons')}
            </Link>
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="space-y-2">
            {data.map((item) => {
              const lesson = item.lesson
              const isCompleted = item.status === 'completed'
              const isUnderReview = item.status === 'under_review'
              const isInProgress = item.status === 'in_progress'
              const skill = lesson?.skill || ''
              const id = lesson?.id

              let href = ROUTES.LESSON
              if (id) {
                if (isCompleted || isUnderReview) {
                  href = `/lesson/${skill}/${id}/result`
                } else {
                  href = getLessonLink(lesson)
                }
              }

              const title = lesson?.title || t('lessonHistory.unknownLesson')
              const level = lesson?.level || ''
              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-card-dark/40 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-primary/40 hover:bg-card-dark/60 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <Link to={href} className="flex flex-1 items-center gap-4 min-w-0">
                    <span className={`w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center shrink-0 ${isCompleted ? 'text-green-400' : isUnderReview ? 'text-amber-400' : 'text-primary'}`}>
                      <span className="material-symbols-outlined">
                        {isCompleted ? 'check_circle' : isUnderReview ? 'rate_review' : 'play_circle'}
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white group-hover:text-primary transition-colors truncate">
                        {title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {level && (
                          <span className="px-1.5 py-0.5 bg-gray-700 text-gray-400 text-[10px] font-medium rounded">
                            {level}
                          </span>
                        )}
                        {skill && (
                          <span className="text-[10px] text-gray-500">{t(`skills.${skill}`)}</span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-medium text-green-400">{t('lessonHistory.completed')}</span>
                        )}
                        {isUnderReview && (
                          <span className="text-[10px] font-medium text-amber-400">{t('lessonHistory.underReview') || 'Under Review'}</span>
                        )}
                        {isInProgress && (
                          <span className="text-[10px] font-medium text-yellow-500">{t('lessonHistory.inProgress')}</span>
                        )}
                        {item.progress != null && (
                          <span className="text-[10px] text-gray-500">{item.progress}%</span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                    {/* View Result / Continue button */}
                    <Link
                      to={href}
                      className={`px-4 py-2 w-full sm:w-auto text-center font-bold text-xs rounded-lg transition-all ${isCompleted
                          ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                          : isUnderReview
                            ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white'
                            : 'bg-primary text-background-dark hover:brightness-110'
                        }`}
                    >
                      {isCompleted ? t('lessonResult.viewResult') || t('lessonHistory.viewResult') : isUnderReview ? (t('lessonHistory.viewSubmission') || 'View Submission') : t('lessonHistory.continue')}
                    </Link>

                    {/* Retry Button (only for completed or in-progress) */}
                    {(!isUnderReview && id) && (
                      <Link
                        to={getLessonLink(lesson)}
                        className="px-4 py-2 w-full sm:w-auto text-center bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white font-bold text-xs rounded-lg transition-all border border-border-dark flex items-center justify-center gap-1.5"
                        title={t('lessonResult.retry')}
                      >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        {t('lessonResult.retry') || 'Retry'}
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && data.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-8">
            <button
              type="button"
              onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo(0, 0) }}
              disabled={currentPage <= 1}
              className="size-10 flex items-center justify-center rounded-xl bg-card-dark border border-border-dark text-gray-400 hover:text-primary hover:border-primary disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPage(p); window.scrollTo(0, 0) }}
                  className={`size-10 flex items-center justify-center rounded-xl text-xs font-black transition-all border ${currentPage === p
                      ? 'bg-primary border-primary text-background-dark shadow-lg shadow-primary/20'
                      : 'bg-card-dark border-border-dark text-gray-500 hover:border-gray-600 hover:text-gray-300'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo(0, 0) }}
              disabled={currentPage >= totalPages}
              className="size-10 flex items-center justify-center rounded-xl bg-card-dark border border-border-dark text-gray-400 hover:text-primary hover:border-primary disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
