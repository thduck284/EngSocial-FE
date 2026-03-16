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
        const list = res?.data?.data ?? res?.data ?? []
        const pag = res?.data?.pagination ?? res?.pagination ?? null
        setData(Array.isArray(list) ? list : [])
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
        <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">history</span>
            {t('lessonHistory.title')}
          </h3>
          <p className="text-xs text-gray-400 mb-4">{t('lessonHistory.subtitle')}</p>
          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-400">{t('lessonHistory.filterStatus')}</label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white focus:ring-primary focus:border-primary"
            >
              <option value="">{t('lessonHistory.statusAll')}</option>
              <option value="completed">{t('lessonHistory.statusCompleted')}</option>
              <option value="in_progress">{t('lessonHistory.statusInProgress')}</option>
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
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              {t('lessonHistory.reset')}
            </button>
          </div>
          <Link
            to={ROUTES.LESSON}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-background-dark hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium border border-border-dark transition-all"
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
              const href = lesson?.id ? getLessonLink(lesson) : ROUTES.LESSON
              const title = lesson?.title || t('lessonHistory.unknownLesson')
              const level = lesson?.level || ''
              const skill = lesson?.skill || ''
              const isCompleted = item.status === 'completed'
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-card-dark rounded-xl border border-border-dark hover:border-primary/50 transition-all group"
                >
                  <Link to={href} className="flex flex-1 items-center gap-4 min-w-0">
                    <span className="w-10 h-10 rounded-lg bg-gray-700 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">
                        {isCompleted ? 'check_circle' : 'play_circle'}
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
                        <span className={`text-[10px] font-medium ${isCompleted ? 'text-green-400' : 'text-yellow-500'}`}>
                          {isCompleted ? t('lessonHistory.completed') : t('lessonHistory.inProgress')}
                        </span>
                        {item.progress != null && (
                          <span className="text-[10px] text-gray-500">{item.progress}%</span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    {isCompleted && skill === 'reading' && lesson?.id && (
                      <Link
                        to={ROUTES.LESSON_READING_RESULT(lesson.id)}
                        className="px-4 py-2 bg-primary text-white hover:brightness-110 font-bold text-xs rounded-lg transition-all"
                      >
                        {t('lessonHistory.viewResult')}
                      </Link>
                    )}
                    <Link
                      to={href}
                      className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-background-dark font-bold text-xs rounded-lg transition-all"
                    >
                      {isCompleted ? t('lessonHistory.viewAgain') : t('lessonHistory.continue')}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && data.length > 0 && totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-4 py-2 rounded-lg bg-card-dark border border-border-dark text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('readingLesson.previous')}
            </button>
            <span className="px-4 py-2 text-sm text-gray-400">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 rounded-lg bg-card-dark border border-border-dark text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('readingLesson.next')}
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
