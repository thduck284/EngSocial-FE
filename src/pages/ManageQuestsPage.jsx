import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { useManageQuestForm } from '../hooks/useManageQuestForm'
import { ROUTES } from '../constants'

/** Category không dùng skill / % điểm bài học (xã hội + streak + thời gian online). */
const NO_SKILL_SCORE_CATEGORIES = [
  'friends',
  'vocabulary_notes',
  'community_post',
  'login_streak',
  'online_time',
]

const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5'
const inputClass =
  'w-full min-h-[42px] bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary/40 transition-shadow'

function targetHintKey(category) {
  switch (category) {
    case 'friends':
      return 'manageQuests.targetHintFriends'
    case 'vocabulary_notes':
      return 'manageQuests.targetHintVocabularyNotes'
    case 'community_post':
      return 'manageQuests.targetHintCommunityPost'
    case 'login_streak':
      return 'manageQuests.targetHintLoginStreak'
    case 'online_time':
      return 'manageQuests.targetHintOnlineTime'
    case 'practice':
      return 'manageQuests.targetHintPractice'
    case 'all':
      return 'manageQuests.targetHintAll'
    case 'lesson':
    default:
      return 'manageQuests.targetHintLesson'
  }
}

export function ManageQuestsPage() {
  const { t } = useTranslation()
  const { id, userId } = useParams()
  const listPath = userId != null && userId !== '' ? ROUTES.MANAGE_QUESTS(userId) : ROUTES.QUESTS
  const { form, setForm, error, loading, loadingQuest, isEdit, save } = useManageQuestForm(id, t)

  const category = form.condition?.filters?.category || 'all'
  const skillLabel =
    category === 'practice'
      ? t('manageQuests.skillPracticeLabel')
      : category === 'lesson'
        ? t('manageQuests.skillLessonLabel')
        : t('manageQuests.skill')
  const { showSkill, showMinScore, isSocial } = useMemo(() => {
    const showSkill = ['lesson', 'practice', 'all'].includes(category)
    /** Chỉ lesson / “tất cả” dùng % điểm bài học; practice không hiển thị (backend cũng ép 0). */
    const showMinScore = ['lesson', 'all'].includes(category)
    const isSocial = NO_SKILL_SCORE_CATEGORIES.includes(category)
    return { showSkill, showMinScore, isSocial }
  }, [category])

  if (loadingQuest) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex justify-center items-center min-h-[200px]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {error && (
        <div className="mb-6 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link to={listPath} className="hover:text-primary transition-colors">{t('manageQuests.back')}</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-gray-400">{t('manageQuests.questsLabel')}</span>
        </nav>
        <h1 className="text-2xl md:text-3xl font-bold text-white">{isEdit ? t('manageQuests.editQuest') : t('manageQuests.addQuest')}</h1>
        <p className="text-xs text-gray-500 mt-2 max-w-3xl leading-relaxed">{t('manageQuests.poolFormHint')}</p>
      </div>

      <div className="space-y-6 w-full">
        <div className="p-5 md:p-6 bg-card-dark rounded-2xl border border-border-dark">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-white pb-4 border-b border-border-dark">
            <span className="material-symbols-outlined text-primary">flag</span>
            {t('manageQuests.questInfo')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label className={labelClass}>{t('manageQuests.type')}</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                <option value="daily">{t('manageQuests.typeDaily')}</option>
                <option value="weekly">{t('manageQuests.typeWeekly')}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('manageQuests.category')}</label>
              <select
                value={form.condition?.filters?.category || 'all'}
                onChange={(e) => {
                  const next = e.target.value
                  const noSkillScore = NO_SKILL_SCORE_CATEGORIES.includes(next)
                  const filters = { ...(form.condition?.filters || {}), category: next }
                  if (noSkillScore) {
                    filters.skill = 'all'
                    filters.minScorePercent = 0
                  } else if (next === 'practice') {
                    filters.minScorePercent = 0
                  }
                  setForm({
                    ...form,
                    condition: { ...form.condition, filters },
                  })
                }}
                className={inputClass}
              >
                <option value="all">{t('manageQuests.categoryAll')}</option>
                <option value="lesson">{t('manageQuests.categoryLesson')}</option>
                <option value="practice">{t('manageQuests.categoryPractice')}</option>
                <option value="friends">{t('manageQuests.categoryFriends')}</option>
                <option value="vocabulary_notes">{t('manageQuests.categoryVocabularyNotes')}</option>
                <option value="community_post">{t('manageQuests.categoryCommunityPost')}</option>
                <option value="login_streak">{t('manageQuests.categoryLoginStreak')}</option>
                <option value="online_time">{t('manageQuests.categoryOnlineTime')}</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>{t('manageQuests.targetMin')}</label>
              <input
                type="number"
                min={1}
                value={form.condition?.targetMin ?? 1}
                onChange={(e) => {
                  const v = +e.target.value || 1
                  const max = form.condition?.targetMax ?? v
                  setForm({
                    ...form,
                    condition: {
                      ...form.condition,
                      targetMin: v,
                      targetMax: max < v ? v : max,
                    },
                  })
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('manageQuests.targetMax')}</label>
              <input
                type="number"
                min={1}
                value={form.condition?.targetMax ?? form.condition?.targetMin ?? 1}
                onChange={(e) => {
                  const min = form.condition?.targetMin ?? 1
                  const v = +e.target.value || min
                  setForm({
                    ...form,
                    condition: { ...form.condition, targetMax: v < min ? min : v },
                  })
                }}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2 rounded-xl bg-background-dark/50 border border-border-dark/80 px-4 py-3 space-y-2">
              <p className="text-xs text-gray-400 leading-relaxed">{t('manageQuests.targetRangeHint')}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{t(targetHintKey(category))}</p>
            </div>

            <div>
              <label className={labelClass}>{t('manageQuests.xpReward')}</label>
              <input
                type="number"
                min={0}
                value={form.xpReward}
                onChange={(e) => setForm({ ...form, xpReward: +e.target.value || 50 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('manageQuests.status')}</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                <option value="active">{t('manageQuests.statusActive')}</option>
                <option value="archived">{t('manageQuests.statusArchived')}</option>
              </select>
            </div>

            <div className={showSkill ? '' : 'md:col-span-2'}>
              <label className={labelClass}>{t('manageQuests.icon')}</label>
              <input
                value={form.icon || 'flag'}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className={inputClass}
                placeholder={t('manageQuests.iconPlaceholder')}
              />
            </div>
            {showSkill ? (
              <div>
                <label className={labelClass}>{skillLabel}</label>
                <select
                  value={form.condition?.filters?.skill || 'all'}
                  onChange={(e) => setForm({
                    ...form,
                    condition: {
                      ...form.condition,
                      filters: { ...(form.condition?.filters || {}), skill: e.target.value },
                    },
                  })}
                  className={inputClass}
                >
                  <option value="all">{t('manageQuests.skillAll')}</option>
                  <option value="reading">{t('manageQuests.skillReading')}</option>
                  <option value="listening">{t('manageQuests.skillListening')}</option>
                  <option value="writing">{t('manageQuests.skillWriting')}</option>
                </select>
                {category === 'all' ? (
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed">{t('manageQuests.skillHintAll')}</p>
                ) : null}
                {category === 'lesson' ? (
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed">{t('manageQuests.skillHintLesson')}</p>
                ) : null}
                {category === 'practice' ? (
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed">{t('manageQuests.skillHintPractice')}</p>
                ) : null}
              </div>
            ) : null}

            {showMinScore ? (
              <div className="md:col-span-2">
                <label className={labelClass}>{t('manageQuests.minScorePercent')}</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.condition?.filters?.minScorePercent ?? 0}
                  onChange={(e) => setForm({
                    ...form,
                    condition: {
                      ...form.condition,
                      filters: { ...(form.condition?.filters || {}), minScorePercent: +e.target.value || 0 },
                    },
                  })}
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                  {category === 'all' ? t('manageQuests.minScorePercentHintAll') : t('manageQuests.minScorePercentHintLesson')}
                </p>
              </div>
            ) : null}
          </div>

          {isSocial ? (
            <p className="mt-5 text-xs text-sky-300/95 bg-sky-500/10 border border-sky-500/25 rounded-xl px-4 py-3 leading-relaxed">
              {t('manageQuests.socialCategoryNote')}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-border-dark">
        <Link to={listPath} className="px-4 py-2 rounded-lg border border-border-dark text-sm font-medium hover:bg-white/5 text-gray-400 transition-all">
          {t('manageQuests.cancel')}
        </Link>
        <button type="button" onClick={save} disabled={loading || loadingQuest} className="px-6 py-2.5 rounded-xl bg-primary text-background-dark text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all">
          {loading ? t('manageQuests.saving') : isEdit ? t('manageQuests.update') : t('manageQuests.saveQuestBtn')}
        </button>
      </div>
    </div>
  )
}
