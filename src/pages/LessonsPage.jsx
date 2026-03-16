import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants'
import { TOPIC_OPTIONS, SKILL_TABS_LESSONS, LEVEL_COLORS } from '../constants/lessons'
import { getLessonLink } from '../utils/lesson'
import { useLessonsList } from '../hooks/useLessonsList'

export function LessonsPage() {
  const { t } = useTranslation()
  const { isModerator, isAdmin } = useAuth()
  const canAddLesson = isModerator || isAdmin

  const {
    skillFilter,
    topicFilter,
    levelFilter,
    lessons,
    loading,
    error,
    page,
    setPage,
    pagination,
    setSkill,
    setTopic,
    setLevel,
    handleDeleteLesson,
    deletingId,
  } = useLessonsList()

  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')

  const onDeleteLesson = (lesson) => {
    handleDeleteLesson(lesson, t('lessons.confirmDeleteLesson', { title: lesson.title }))
  }

  return (
    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-6 p-6">
      {/* Left sidebar - sticky scroll theo trang */}
      <aside className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-20 lg:self-start">
        <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">school</span>
              {t('header.lessons')}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <Link
                to={ROUTES.LESSON_HISTORY}
                className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-primary transition-all"
                title={t('lessons.viewHistory')}
              >
                <span className="material-symbols-outlined text-lg">history</span>
              </Link>
              {canAddLesson && (
                <Link
                  to={ROUTES.MANAGE_LESSONS}
                  className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-background-dark transition-all"
                  title={t('lessons.addLesson')}
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                </Link>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            {skillFilter === 'all'
              ? t('skills.all') + ' ' + t('header.lessons').toLowerCase()
              : t(`skills.${skillFilter}`) + ' ' + t('header.lessons').toLowerCase()}
          </p>
          <div className="space-y-2">
            {SKILL_TABS_LESSONS.map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setSkill(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  (key === 'all' && skillFilter === 'all') || skillFilter === key
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'hover:bg-gray-700 text-gray-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{icon}</span>
                {t(label)}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border-dark space-y-4">
            <div>
              <h4 className="font-semibold text-xs text-gray-400 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">bar_chart</span>
                {t('skills.filterLevel')}
              </h4>
              <select
                value={levelFilter}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white focus:ring-primary focus:border-primary"
              >
                <option value="all">{t('skills.filterAll')}</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
            <div>
              <h4 className="font-semibold text-xs text-gray-400 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">category</span>
                {t('lessons.filterTopic')}
              </h4>
              <select
                value={topicFilter}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white focus:ring-primary focus:border-primary"
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
        <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">note_alt</span>
            <h3 className="font-bold text-sm">{t('lesson.myNotes')}</h3>
          </div>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-xl p-3 text-sm focus:ring-primary focus:border-primary placeholder:text-gray-500 text-white mb-3"
            placeholder={t('lesson.noteTitlePlaceholder')}
          />
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-xl p-3 text-sm focus:ring-primary focus:border-primary placeholder:text-gray-500 text-white"
            placeholder={t('lesson.noteContentPlaceholder')}
            rows={3}
          />
          <button
            type="button"
            className="mt-3 w-full py-2 bg-background-dark hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all border border-border-dark"
          >
            {t('lesson.saveNote')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <section className="col-span-12 lg:col-span-9 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">{t('header.lessons')}</h1>
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.LESSON_HISTORY}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-card-dark hover:bg-gray-700 text-gray-300 hover:text-white font-bold rounded-xl text-sm transition-all"
            >
              <span className="material-symbols-outlined text-lg">history</span>
              {t('lessons.viewHistory')}
            </Link>
            {canAddLesson && (
              <Link
                to={ROUTES.MANAGE_LESSONS}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-xl text-sm transition-all shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                {t('lessons.addLesson')}
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="bg-card-dark p-1 rounded-xl flex border border-border-dark flex-1 min-w-0">
            {SKILL_TABS_LESSONS.map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setSkill(key)}
                type="button"
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  (key === 'all' && skillFilter === 'all') || skillFilter === key
                    ? 'bg-background-dark border border-border-dark text-primary font-bold'
                    : 'hover:bg-gray-700 text-gray-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{icon}</span>
                {t(label)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-400 hidden sm:inline">{t('lessons.filterTopic')}:</span>
            <select
              value={topicFilter}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-card-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white focus:ring-primary focus:border-primary min-w-[140px]"
            >
              {TOPIC_OPTIONS.map(({ key, label }) => (
                <option key={key} value={key}>
                  {t(label)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        )}

        {error && (
          <div className="py-8 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {!loading && !error && lessons.length > 0 && (
          <div className="space-y-2">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center gap-4 p-4 bg-card-dark rounded-xl border border-border-dark hover:border-primary/50 transition-all group"
              >
                <Link to={getLessonLink(lesson)} className="flex flex-1 items-center gap-4 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-gray-700 text-gray-400 flex items-center justify-center text-sm font-bold shrink-0">
                    {index + 1}
                  </span>
                  <div
                    className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0"
                    style={{
                      backgroundImage: lesson.thumbnail
                        ? `url('${lesson.thumbnail}')`
                        : 'linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%)',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h5 className="font-bold text-sm group-hover:text-primary transition-colors">
                        {lesson.title}
                      </h5>
                      <span
                        className={`px-1.5 py-0.5 ${LEVEL_COLORS[lesson.level] || 'bg-gray-600 text-gray-300'} text-[9px] font-bold rounded`}
                      >
                        {lesson.level}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          lesson.skill === 'reading'
                            ? 'bg-blue-500/10 text-blue-400'
                            : lesson.skill === 'listening'
                              ? 'bg-orange-500/10 text-orange-400'
                              : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {t(`skills.${lesson.skill}`)}
                      </span>
                    </div>
                    {lesson.description && (
                      <p className="text-xs text-gray-400 line-clamp-1">{lesson.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {lesson.topic && (
                        <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1 w-fit">
                          <span className="material-symbols-outlined text-xs">category</span>
                          {lesson.topic}
                        </span>
                      )}
                      {lesson.estimatedTime && (
                        <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1 w-fit">
                          <span className="material-symbols-outlined text-xs">timer</span>
                          {lesson.estimatedTime}m
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[10px] text-yellow-500">
                        <span className="material-symbols-outlined text-xs fill-icon">star</span>
                        {(lesson.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </Link>
                {canAddLesson && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Link to={`/manage/lessons/${lesson.id}`} className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-primary transition-colors" title={t('quests.edit')}>
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </Link>
                    <button type="button" onClick={() => onDeleteLesson(lesson)} disabled={deletingId === lesson.id} className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50" title={t('quests.delete')}>
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                )}
                <Link to={getLessonLink(lesson)} className="px-4 py-2 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-background-dark font-bold text-xs rounded-lg transition-all shrink-0">
                  {t('buttons.start')}
                </Link>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && lessons.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-4 block opacity-50">menu_book</span>
            <p>{t('header.lessons')} - No lessons found.</p>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-lg bg-card-dark border border-border-dark text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              {t('buttons.prev') || 'Trước'}
            </button>
            <span className="px-4 py-2 text-sm text-gray-400">
              {page} / {pagination.totalPages} ({pagination.total} {t('header.lessons')})
            </span>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="px-4 py-2 rounded-lg bg-card-dark border border-border-dark text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              {t('buttons.next') || 'Sau'}
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
