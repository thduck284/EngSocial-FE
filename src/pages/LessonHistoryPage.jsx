import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../constants'
import { lessonsService } from '../services'
import { getLessonLink } from '../utils/lesson'
import { buildLessonResultUrl } from '../utils/lessonResultLinks'

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
        <div className="bg-white dark:bg-card-dark/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-xl relative overflow-hidden group/sidebar">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover/sidebar:opacity-100 transition-opacity" />
          <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-3 mb-5 text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">history</span>
            {t('lessonHistory.title')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-6 leading-relaxed font-medium">{t('lessonHistory.subtitle')}</p>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 px-1 tracking-wider">{t('lessonHistory.filterStatus')}</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
              >
                <option value="">{t('lessonHistory.statusAll')}</option>
                <option value="completed">{t('lessonHistory.statusCompleted')}</option>
                <option value="under_review">{t('lessonHistory.statusUnderReview')}</option>
                {filterSkill !== 'writing' && (
                  <option value="in_progress">{t('lessonHistory.statusInProgress')}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 px-1 tracking-wider">{t('lessonHistory.filterSkill')}</label>
              <select
                value={filterSkill}
                onChange={(e) => { setFilterSkill(e.target.value); setPage(1) }}
                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
              >
                <option value="">{t('skills.all')}</option>
                <option value="reading">{t('skills.reading')}</option>
                <option value="listening">{t('skills.listening')}</option>
                <option value="writing">{t('skills.writing')}</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 px-1 tracking-wider">{t('lessonHistory.filterCategory')}</label>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPage(1) }}
                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
              >
                <option value="">{t('lessonHistory.categoryAll')}</option>
                <option value="lesson">{t('lessonHistory.categoryLesson')}</option>
                <option value="practice">{t('lessonHistory.categoryPractice')}</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setFilterStatus('')
                setFilterSkill('')
                setFilterCategory('')
                setPage(1)
              }}
              className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl text-xs font-black text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              {t('lessonHistory.reset')}
            </button>
          </div>
          <Link
            to={ROUTES.LESSON}
            className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-slate-100 dark:bg-white/5 hover:bg-primary hover:text-white text-slate-600 dark:text-gray-300 rounded-xl text-xs font-black border border-transparent transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            {t('lessonHistory.backToLessons')}
          </Link>
        </div>
      </aside>

      <section className="col-span-12 lg:col-span-9 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('lessonHistory.title')}</h1>
        </div>

        {loading && (
          <div className="flex justify-center py-24">
            <span className="material-symbols-outlined animate-spin text-5xl text-primary opacity-50">progress_activity</span>
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-4 rounded-3xl bg-white dark:bg-card-dark border-2 border-dashed border-slate-200 dark:border-border-dark text-center shadow-sm">
            <div className="size-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-gray-500">history_edu</span>
            </div>
            <p className="text-slate-500 dark:text-gray-400 mb-6 font-bold">{t('lessonHistory.empty')}</p>
            <Link to={ROUTES.LESSON} className="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:brightness-110 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined">school</span>
              {t('lessonHistory.goToLessons')}
            </Link>
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="space-y-3">
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
                  href = buildLessonResultUrl(lesson, {
                    attemptNo: item.attemptNo,
                    category: lesson?.category,
                  }) || `/lesson/${skill}/${id}/result`
                } else {
                  href = getLessonLink(lesson)
                }
              }

              const title = lesson?.title || t('lessonHistory.unknownLesson')
              const level = lesson?.level || ''
              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-white dark:bg-card-dark/40 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/5 hover:border-primary/40 dark:hover:border-primary/40 hover:shadow-lg transition-all group relative overflow-hidden shadow-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <Link to={href} className="flex flex-1 items-center gap-4 min-w-0">
                    <span className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : isUnderReview ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-primary/10 text-primary'}`}>
                      <span className="material-symbols-outlined text-2xl">
                        {isCompleted ? 'check_circle' : isUnderReview ? 'rate_review' : 'play_circle'}
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                        {title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {level && (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 text-[10px] font-black rounded uppercase shadow-sm">
                            {level}
                          </span>
                        )}
                        {skill && (
                          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">{t(`skills.${skill}`)}</span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">{t('lessonHistory.completed')}</span>
                        )}
                        {isUnderReview && (
                          <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">{t('lessonHistory.underReview') || 'Under Review'}</span>
                        )}
                        {isInProgress && (
                          <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-500 uppercase bg-yellow-50 dark:bg-yellow-500/10 px-2 py-0.5 rounded-full">{t('lessonHistory.inProgress')}</span>
                        )}
                        {item.progress != null && (
                          <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded-full border border-slate-100 dark:border-transparent">{item.progress}%</span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full sm:w-auto">
                    {/* View Result / Continue button */}
                    <Link
                      to={href}
                      className={`px-5 py-2.5 w-full sm:w-auto text-center font-black text-xs rounded-xl transition-all shadow-sm ${isCompleted
                          ? 'bg-emerald-500 text-white hover:brightness-110 shadow-emerald-500/20'
                          : isUnderReview
                            ? 'bg-amber-500 text-white hover:brightness-110 shadow-amber-500/20'
                            : 'bg-primary text-white hover:brightness-110 shadow-primary/20'
                        }`}
                    >
                      {isCompleted ? t('lessonResult.viewResult') || t('lessonHistory.viewResult') : isUnderReview ? (t('lessonHistory.viewSubmission') || 'View Submission') : t('lessonHistory.continue')}
                    </Link>

                    {/* Retry Button (only for completed or in-progress) */}
                    {(!isUnderReview && id) && (
                      <Link
                        to={getLessonLink(lesson)}
                        className="px-5 py-2.5 w-full sm:w-auto text-center bg-slate-50 dark:bg-gray-700/50 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white font-black text-xs rounded-xl transition-all border border-slate-200 dark:border-border-dark flex items-center justify-center gap-2 shadow-sm"
                        title={t('lessonResult.retry')}
                      >
                        <span className="material-symbols-outlined text-lg">refresh</span>
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
              className="size-12 flex items-center justify-center rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark text-slate-400 dark:text-gray-400 hover:text-primary hover:border-primary disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPage(p); window.scrollTo(0, 0) }}
                  className={`size-12 flex items-center justify-center rounded-2xl text-xs font-black transition-all border ${currentPage === p
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25 scale-110'
                      : 'bg-white dark:bg-card-dark border-slate-200 dark:border-border-dark text-slate-500 dark:text-gray-500 hover:border-primary hover:text-primary shadow-sm'
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
              className="size-12 flex items-center justify-center rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark text-slate-400 dark:text-gray-400 hover:text-primary hover:border-primary disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
