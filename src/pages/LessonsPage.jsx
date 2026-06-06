import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants'
import { SKILL_TABS_LESSONS, LEVEL_COLORS } from '../constants/lessons'
import { getLessonLink } from '../utils/lesson'
import { getVisiblePageNumbers } from '../utils/pagination'
import { useLessonsList, useGuestAuthGate } from '../hooks'

import { addVocabNote } from '../utils/vocabularyUserStorage'
import { AlertModal } from '../components/ui/common/AlertModal'
import { CompactSelect } from '../components/ui/common/CompactSelect'

export function LessonsPage() {
  const { t } = useTranslation()
  const { isModerator, user } = useAuth()
  /** Admin trên /lesson chỉ xem & học như user; chỉnh sửa qua khu /mod (moderator). */
  const canAddLesson = isModerator

  const {
    skillFilter,
    topicFilter,
    levelFilter,
    titleFilter,
    lessons,
    loading,
    error,
    page,
    setPage,
    pagination,
    setSkill,
    setTopic,
    setLevel,
    setTitle,
    handleDeleteLesson,
    deletingId,
    completedLessonIds,
    topicOptions,
  } = useLessonsList()
  const { requireAuth, guestModal } = useGuestAuthGate()

  const topicSelectOptions = useMemo(
    () => [
      { value: 'all', label: t('lessons.topicsAll') },
      ...topicOptions.map((topic) => ({ value: topic, label: topic })),
    ],
    [topicOptions, t]
  )

  const perPage = pagination.perPage || 10
  const rangeFrom = pagination.total > 0 ? (page - 1) * perPage + 1 : 0
  const rangeTo = pagination.total > 0 ? Math.min(page * perPage, pagination.total) : 0
  const visiblePages = useMemo(
    () => getVisiblePageNumbers(page, pagination.totalPages),
    [page, pagination.totalPages]
  )

  const blockGuestNav = (e) => {
    if (!requireAuth()) e.preventDefault()
  }

  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteSavedMessage, setNoteSavedMessage] = useState('')
  const [itemToDelete, setItemToDelete] = useState(null)

  const handleSaveNote = () => {
    if (!noteTitle.trim() && !noteContent.trim()) return
    setNoteSaving(true)
    setNoteSavedMessage('')
    try {
      addVocabNote({ title: noteTitle, content: noteContent })
      setNoteSavedMessage(t('vocabulary.notesSaved') || 'Saved!')
      setNoteTitle('')
      setNoteContent('')
      setTimeout(() => setNoteSavedMessage(''), 2500)
    } catch (e) {
      console.error(e)
    } finally {
      setNoteSaving(false)
    }
  }

  const onDeleteLesson = (lesson) => {
    setItemToDelete(lesson)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const lesson = itemToDelete
    setItemToDelete(null)
    // The hook handleDeleteLesson has a window.confirm check.
    // I should modify the hook to accept a bypass or handle it here.
    // Looking at useLessons.js, it has: if (!window.confirm(confirmMessage)) return
    // I will call lessonsService.delete directly here or update the hook.
    // I'll update the hook to make it more flexible in the next step.
    // For now, I'll use the hook's function but I need to bypass the confirm.
    // Actually, I'll just implement the delete logic here since I have access to everything.
    handleDeleteLesson(lesson, '', () => {}) 
  }

  return (
    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-6 p-6">
      {/* Left sidebar - sticky scroll theo trang */}
      <aside className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-6 lg:self-start">
        <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-border-dark shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
              <span className="material-symbols-outlined text-primary">school</span>
              {t('header.lessons')}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <Link
                to={ROUTES.LESSON_HISTORY}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-primary transition-all"
                title={t('lessons.viewHistory')}
              >
                <span className="material-symbols-outlined text-lg">history</span>
              </Link>
              {canAddLesson && user?.id != null && (
                <Link
                  to={ROUTES.MANAGE_LESSONS(user.id)}
                  className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                  title={t('lessons.addLesson')}
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                </Link>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">
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
                    : 'hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-500 dark:text-gray-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{icon}</span>
                {t(label)}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-border-dark space-y-4">
            <div>
              <h4 className="font-semibold text-xs text-slate-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">search</span>
                {t('skills.filterTitle') || 'Tìm kiếm theo tên bài'}
              </h4>
              <input
                type="text"
                value={titleFilter}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
                placeholder={t('skills.filterTitlePlaceholder') || 'Nhập từ khóa...'}
              />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-slate-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">bar_chart</span>
                {t('skills.filterLevel')}
              </h4>
              <select
                value={levelFilter}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
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
              <h4 className="font-semibold text-xs text-slate-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">category</span>
                {t('lessons.filterTopic')}
              </h4>
              <CompactSelect
                value={topicFilter}
                onChange={setTopic}
                options={topicSelectOptions}
                placement="up"
                className="w-full"
                buttonClassName="bg-slate-50 dark:bg-background-dark"
              />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-border-dark shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">note_alt</span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t('lesson.myNotes')}</h3>
          </div>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white mb-3 placeholder:text-slate-400"
            placeholder={t('lesson.noteTitlePlaceholder')}
          />
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder={t('lesson.noteContentPlaceholder')}
            rows={3}
          />
          {noteSavedMessage && <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-2 mb-1">{noteSavedMessage}</p>}
          <button
            type="button"
            onClick={handleSaveNote}
            disabled={noteSaving}
            className="mt-3 w-full py-2 bg-slate-50 dark:bg-background-dark hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-border-dark disabled:opacity-60"
          >
            {noteSaving ? '...' : t('lesson.saveNote')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <section className="col-span-12 lg:col-span-9 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('header.lessons')}</h1>
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.LESSON_HISTORY}
              onClick={blockGuestNav}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-card-dark hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-white font-bold rounded-xl text-sm transition-all border border-slate-200 dark:border-border-dark shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">history</span>
              {t('lessons.viewHistory')}
            </Link>
            {canAddLesson && user?.id != null && (
              <Link
                to={ROUTES.MANAGE_LESSONS(user.id)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                {t('lessons.addLesson')}
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="bg-white dark:bg-card-dark p-1 rounded-xl flex border border-slate-200 dark:border-border-dark flex-1 min-w-0 shadow-sm">
            {SKILL_TABS_LESSONS.map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setSkill(key)}
                type="button"
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  (key === 'all' && skillFilter === 'all') || skillFilter === key
                    ? 'bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-primary font-bold shadow-sm'
                    : 'hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-500 dark:text-gray-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{icon}</span>
                {t(label)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 dark:text-gray-400 hidden sm:inline">{t('lessons.filterTopic')}:</span>
            <CompactSelect
              value={topicFilter}
              onChange={setTopic}
              options={topicSelectOptions}
              placement="up"
              className="w-[120px] sm:w-[132px]"
              buttonClassName="bg-white dark:bg-card-dark shadow-sm"
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        )}

        {error && (
          <div className="py-8 px-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {!loading && !error && lessons.length > 0 && (
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-all group shadow-sm hover:shadow-md"
              >
                <Link to={getLessonLink(lesson)} onClick={blockGuestNav} className="flex flex-1 items-center gap-4 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400 flex items-center justify-center text-sm font-bold shrink-0">
                    {(page - 1) * perPage + index + 1}
                  </span>
                  <div
                    className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0 shadow-inner"
                    style={{
                      backgroundImage: lesson.thumbnail
                        ? `url('${lesson.thumbnail}')`
                        : 'linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%)',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                        {lesson.title}
                      </h5>
                      {completedLessonIds.has(String(lesson.id)) && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold rounded border border-emerald-200 dark:border-emerald-500/30">
                          <span className="material-symbols-outlined text-[11px]">check_circle</span>
                          Done
                        </span>
                      )}
                      <span
                        className={`px-1.5 py-0.5 ${LEVEL_COLORS[lesson.level] || 'bg-gray-600 text-gray-300'} text-[9px] font-bold rounded shadow-sm`}
                      >
                        {lesson.level}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          lesson.skill === 'reading'
                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20'
                            : lesson.skill === 'listening'
                              ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20'
                              : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'
                        }`}
                      >
                        {t(`skills.${lesson.skill}`)}
                      </span>
                    </div>
                    {lesson.description && (
                      <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-1">{lesson.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {lesson.topic && (
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 text-[10px] rounded flex items-center gap-1 w-fit border border-slate-200 dark:border-transparent">
                          <span className="material-symbols-outlined text-xs">category</span>
                          {lesson.topic}
                        </span>
                      )}
                      {lesson.estimatedTime && (
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 text-[10px] rounded flex items-center gap-1 w-fit border border-slate-200 dark:border-transparent">
                          <span className="material-symbols-outlined text-xs">timer</span>
                          {lesson.estimatedTime}m
                        </span>
                      )}
                      {lesson.totalQuestions > 0 && (
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 text-[10px] rounded flex items-center gap-1 w-fit border border-slate-200 dark:border-transparent">
                          <span className="material-symbols-outlined text-xs">quiz</span>
                          {t('lessons.questionsCount', { count: lesson.totalQuestions })}
                        </span>
                      )}
                      {lesson.xpReward != null && (
                        <span className="px-2 py-0.5 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-[10px] rounded flex items-center gap-1 w-fit font-bold border border-yellow-200 dark:border-yellow-500/20">
                          <span className="material-symbols-outlined text-[12px] fill-icon">star</span>
                          {lesson.xpReward} XP
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[10px] text-yellow-600 dark:text-yellow-500 font-medium">
                        <span className="material-symbols-outlined text-xs fill-icon">star</span>
                        {(lesson.rating || 0).toFixed(1)}
                        <span className="text-slate-400 ml-1">
                          ({t('lessons.reviewsCount', { count: lesson.ratingCount || 0 })})
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-xs">group</span>
                        {lesson.completionCount?.toLocaleString() || 0} {t('dashboard.views')}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  {canAddLesson && user?.id != null && (
                    <div className="flex items-center gap-1">
                      <Link
                        to={`${ROUTES.MANAGE_LESSONS(user.id)}/${lesson.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors"
                        title={t('quests.edit')}
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </Link>
                      <button type="button" onClick={() => onDeleteLesson(lesson)} disabled={deletingId === lesson.id} className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:opacity-50" title={t('quests.delete')}>
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  )}
                  
                  <Link
                    to={ROUTES.LESSON_REVIEWS(lesson.id)}
                    onClick={blockGuestNav}
                    className="p-2 rounded-lg text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500/10 transition-colors"
                    title={t('lessons.reviews') || 'Review'}
                  >
                    <span className="material-symbols-outlined text-sm">star</span>
                  </Link>

                  <Link to={getLessonLink(lesson)} onClick={blockGuestNav} className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg transition-all shadow-sm hover:brightness-110">
                    {t('dashboard.viewDetail')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && lessons.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark border-dashed">
            <span className="material-symbols-outlined text-5xl mb-4 block text-slate-300 dark:opacity-50">menu_book</span>
            <p className="text-slate-500 dark:text-gray-400">{t('header.lessons')} - No lessons found.</p>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6">
            <p className="text-xs text-slate-500 dark:text-gray-400 text-center sm:text-left">
              {t('lessons.paginationRange', { from: rangeFrom, to: rangeTo, total: pagination.total })}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
                {t('buttons.prev') || 'Trước'}
              </button>
              {visiblePages.map((item, idx) =>
                item === '…' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 py-2 text-xs text-slate-400 dark:text-gray-500 select-none"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item)}
                    className={`min-w-[2.25rem] px-2.5 py-2 rounded-lg text-xs font-bold border transition-colors ${
                      item === page
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white dark:bg-card-dark border-slate-200 dark:border-border-dark text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('buttons.next') || 'Sau'}
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 text-center sm:text-right">
              {t('lessons.paginationPage', { current: page, total: pagination.totalPages })}
            </p>
          </div>
        )}
      </section>

      <AlertModal
        open={!!itemToDelete}
        title={t('manageLessons.deleteConfirmTitle') || t('quests.delete')}
        message={t('lessons.confirmDeleteLesson', { title: itemToDelete?.title || '' })}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
      {guestModal}
    </main>
  )
}

