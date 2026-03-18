import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { SKILLS, SKILL_TABS } from '../raw'
import { ROUTES } from '../constants'
import { DEFAULT_AVATAR } from '../constants/ui'
import { useSkillPractices } from '../hooks/useLessons'
import { useDashboardSocket, useDashboardFriends } from '../hooks'

// Stable no-op so socket effect does not re-run every render (no group conversations on skills page)
const noopSetGroupConversations = () => {}

export function SkillPracticePage() {
  const { skill = 'reading' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isModerator, isAdmin } = useAuth()
  const canAddPractice = isModerator || isAdmin

  const { onlineUserIds } = useDashboardSocket(user, noopSetGroupConversations)
  const { friendsFilterTab, setFriendsFilterTab, displayedFriendsList } = useDashboardFriends(onlineUserIds)

  const onlineCount = displayedFriendsList.filter((item) => {
    const u = item?.user || item
    const id = u?.id ?? u?._id
    return id != null && onlineUserIds.has(String(id))
  }).length

  const {
    loading,
    page,
    setPage,
    pagination,
    filterLevel,
    setFilterLevel,
    filterTopic,
    setFilterTopic,
    handleApplyFilters,
    handleResetFilters,
    handleDeletePractice,
    deletingId,
    rawData,
    cards,
  } = useSkillPractices(skill, t)

  const current = SKILLS[skill] || SKILLS.reading
  const isReading = skill === 'reading'
  const isListening = skill === 'listening'
  const isWriting = skill === 'writing'
  const challenge = rawData.challenge?.title ? rawData.challenge : { title: t('skills.challengeDefaultTitle'), desc: '', time: '', btn: 'buttons.join' }
  const challengeGradient = isReading ? 'from-indigo-900/40' : isListening ? 'from-orange-900/40' : 'from-emerald-900/40'
  const challengeIcon = isListening ? 'equalizer' : isWriting ? 'edit_square' : 'workspace_premium'
  const achievements = rawData.achievementsBySkill[skill] || rawData.achievementsBySkill.reading || []

  const renderCards = () => {
    if (loading) {
      return (
        <div className="col-span-2 flex justify-center py-16">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      )
    }
    if (cards.length === 0) {
      return (
        <div className="col-span-2 flex flex-col items-center justify-center py-16 px-4 rounded-xl bg-card-dark border border-border-dark text-center">
          <span className="material-symbols-outlined text-5xl text-gray-500 mb-4">folder_off</span>
          <p className="text-gray-400 text-sm mb-4">{t('skills.emptyPractices')}</p>
          {canAddPractice && (
            <Link to={ROUTES.MANAGE_SKILLS} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-xl text-sm transition-all">
              <span className="material-symbols-outlined text-lg">add_circle</span>
              {t('skills.addPractice')}
            </Link>
          )}
        </div>
      )
    }
    if (isReading) {
      return cards.map((card) => (
        <div
          key={card.id || card.title}
          className="bg-card-dark rounded-xl border border-border-dark overflow-hidden group hover:border-primary/50 transition-all"
        >
          <div className="h-32 bg-cover bg-center" style={{ backgroundImage: card.img ? `url('${card.img}')` : undefined }} />
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <h5 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors">{card.title}</h5>
              <span className={`px-1.5 py-0.5 ${card.levelColor} text-[9px] font-bold rounded`}>{card.level}</span>
            </div>
            <p className="text-xs text-gray-400 line-clamp-2">{card.desc}</p>
            <div className="flex flex-wrap gap-2 py-2">
              {card.topic && (
                <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">category</span> {card.topic}
                </span>
              )}
              {card.time && (
                <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">timer</span> {card.time}
                </span>
              )}
              {card.questions && (
                <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">quiz</span> {card.questions}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-dark">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-yellow-500 text-sm fill-icon">star</span>
                <span className="text-[10px] font-bold">{t('skills.ratingLabel')}: {card.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                {canAddPractice && card.id && (
                  <>
                    <Link to={`/manage/skills/${card.id}`} className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-primary transition-colors" title={t('quests.edit')}>
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </Link>
                    <button type="button" onClick={() => handleDeletePractice(card)} disabled={deletingId === card.id} className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50" title={t('quests.delete')}>
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => navigate(`/practice/reading/${card.id}`)}
                  className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-background-dark font-bold text-xs rounded transition-all"
                >
                  {t('buttons.start')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))
    }
    if (isListening) {
      return cards.map((card) => (
        <div
          key={card.id || card.title}
          className="bg-card-dark rounded-xl border border-border-dark overflow-hidden group hover:border-primary/50 transition-all"
        >
          <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: card.img ? `url('${card.img}')` : undefined }}>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-5xl">play_circle</span>
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] font-medium">
              <span className="material-symbols-outlined text-xs text-primary">equalizer</span>
              {t('skills.audioContent')}
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <h5 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors">{card.title}</h5>
              <span className={`px-1.5 py-0.5 ${card.levelColor} text-[9px] font-bold rounded`}>{card.level}</span>
            </div>
            {card.accent && (
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 ${card.accentClass} text-[10px] font-bold rounded-full border`}>{card.accent}</span>
              </div>
            )}
            <p className="text-xs text-gray-400 line-clamp-2">{card.desc}</p>
            <div className="flex flex-wrap gap-2 py-2">
              {card.topic && (
                <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">category</span> {card.topic}
                </span>
              )}
              {card.time && (
                <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">timer</span> {card.time}
                </span>
              )}
              {card.questions && (
                <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">quiz</span> {card.questions}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-dark">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-yellow-500 text-sm fill-icon">star</span>
                <span className="text-[10px] font-bold">{t('skills.ratingLabel')}: {card.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                {canAddPractice && card.id && (
                  <>
                    <Link to={`/manage/skills/${card.id}`} className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-primary transition-colors" title={t('quests.edit')}>
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </Link>
                    <button type="button" onClick={() => handleDeletePractice(card)} disabled={deletingId === card.id} className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50" title={t('quests.delete')}>
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => navigate(`/practice/listening/${card.id}`)}
                  className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-background-dark font-bold text-xs rounded transition-all"
                >
                  {t('buttons.startListening')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))
    }
    if (isWriting) {
      return cards.map((card) => (
        <div
          key={card.id || card.title}
          className="bg-card-dark rounded-xl border border-border-dark overflow-hidden group hover:border-primary/50 transition-all"
        >
          <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: card.img ? `url('${card.img}')` : undefined }}>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-5xl">edit_note</span>
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] font-medium">
              <span className="material-symbols-outlined text-xs text-primary">description</span>
              {t('skills.writingTask')}
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <h5 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors">{card.title}</h5>
              <span className={`px-1.5 py-0.5 ${card.levelColor} text-[9px] font-bold rounded`}>{card.level}</span>
            </div>
            {card.type && (
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 ${card.typeClass} text-[10px] font-bold rounded-full border`}>{card.type}</span>
              </div>
            )}
            <p className="text-xs text-gray-400 line-clamp-2">{card.desc}</p>
            <div className="flex flex-wrap gap-2 py-2">
              {card.topic && (
                <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">category</span> {card.topic}
                </span>
              )}
              {card.length && (
                <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">straighten</span> {card.length}
                </span>
              )}
              {card.time && (
                <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">timer</span> {card.time}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-dark">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-yellow-500 text-sm fill-icon">star</span>
                <span className="text-[10px] font-bold">{t('skills.ratingLabel')}: {card.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                {canAddPractice && card.id && (
                  <>
                    <Link to={`/manage/skills/${card.id}`} className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-primary transition-colors" title={t('quests.edit')}>
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </Link>
                    <button type="button" onClick={() => handleDeletePractice(card)} disabled={deletingId === card.id} className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50" title={t('quests.delete')}>
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => navigate(`/lesson/writing/${card.id}`)}
                  className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-background-dark font-bold text-xs rounded transition-all"
                >
                  {t('buttons.startWriting')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))
    }
    return null
  }

  return (
    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-6 p-6">
      {/* Left sidebar - Add practice + Tabs + Filters + Goals + Roadmap */}
      <aside className="col-span-12 lg:col-span-3 space-y-5 overflow-hidden lg:sticky lg:top-4 self-start max-h-[calc(100vh-64px)] overflow-y-auto">
        <div className="space-y-4">
          <Link
            to={ROUTES.LESSON_HISTORY}
            className="flex items-center justify-center gap-2 w-full py-3 bg-card-dark hover:bg-gray-700 text-gray-300 hover:text-white font-medium rounded-xl text-sm transition-all"
          >
            <span className="material-symbols-outlined text-xl">history</span>
            {t('lessons.viewHistory')}
          </Link>
          {canAddPractice && (
            <Link
              to={ROUTES.MANAGE_SKILLS}
              className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary/90 text-background-dark font-semibold rounded-xl text-sm transition-all shadow-lg shadow-primary/25 border border-primary/30"
            >
              <span className="material-symbols-outlined text-xl">add_circle</span>
              {t('skills.addPractice')}
            </Link>
          )}
          <div className="bg-card-dark rounded-xl border border-border-dark overflow-hidden">
            <div className="grid grid-cols-2 gap-1 p-1.5">
              {SKILL_TABS.map(({ to, key, icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`py-2.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all min-w-0 ${
                    key && key === skill
                      ? 'bg-primary/20 text-primary border border-primary/40 font-semibold'
                      : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-base shrink-0">{icon}</span>
                  <span className="truncate">{t(label)}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-card-dark rounded-xl border border-border-dark p-4 space-y-4">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              {t('skills.filters')}
            </h4>
            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-400">{t('skills.filterLevel')}</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full bg-background-dark border border-border-dark text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2.5 text-white"
              >
                <option value="">{t('skills.filterAll')}</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-400">{t('skills.filterTopic')}</label>
              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="w-full bg-background-dark border border-border-dark text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2.5 text-white"
              >
                <option value="">{t('skills.filterAll')}</option>
                <option value="Work">{t('skills.topicWork')}</option>
                <option value="Study">{t('skills.topicStudy')}</option>
                <option value="Travel">{t('skills.topicTravel')}</option>
                <option value="Food and drink">{t('skills.topicFood')}</option>
                <option value="Transport">{t('skills.topicTransport')}</option>
                <option value="Business">{t('skills.topicBusiness')}</option>
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleResetFilters} type="button" className="flex-1 py-2.5 text-sm font-medium text-gray-400 hover:text-white rounded-lg bg-background-dark border border-border-dark transition-colors">
                {t('buttons.reset')}
              </button>
              <button onClick={handleApplyFilters} type="button" className="flex-1 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:brightness-110 transition-all">
                {t('buttons.save')}
              </button>
            </div>
          </div>
        </div>
        <div className="bg-card-dark rounded-xl border border-border-dark p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">flag</span>
              {t('skills.goals')}
            </h3>
            <div className="flex gap-1.5">
              <button className="size-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-border-dark transition-colors" type="button" title={t('buttons.edit')}>
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
              <button className="size-8 flex items-center justify-center rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 transition-colors" type="button" title={t('buttons.add')}>
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-300">{t('skills.readingDaily')}</span>
                <span className="text-xs font-bold text-primary">80%</span>
              </div>
              <div className="h-2 w-full bg-gray-700/80 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: '80%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-300">{t('skills.vocabularyGoal')}</span>
                <span className="text-xs font-bold text-orange-400">45%</span>
              </div>
              <div className="h-2 w-full bg-gray-700/80 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: '45%' }} />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Center - challenge + cards */}
      <section className="col-span-12 lg:col-span-6 space-y-6">
        <div className={`bg-gradient-to-r ${challengeGradient} to-primary/20 border border-primary/30 rounded-xl p-5 relative overflow-hidden`}>
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-primary text-background-dark text-[10px] font-bold rounded">{t('enter.weeklyChallenge')}</span>
                <span className="text-xs text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span> {challenge.time}
                </span>
              </div>
              <h4 className="font-bold text-lg text-white">{challenge.title}</h4>
              <p className="text-xs text-gray-300">{challenge.desc}</p>
              <button className="mt-2 px-6 py-2 bg-primary text-background-dark font-bold text-sm rounded-lg hover:brightness-110" type="button">
                {t(challenge.btn)}
              </button>
            </div>
            <span className="material-symbols-outlined text-7xl text-primary/20">{challengeIcon}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{renderCards()}</div>

        {!loading && pagination.total > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6 pb-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-lg bg-card-dark border border-border-dark text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
              {t('buttons.prev') || 'Trước'}
            </button>
            <span className="px-4 py-2 text-sm text-gray-300">
              {t('skills.page') || 'Trang'} {page} / {pagination.totalPages} ({pagination.total} {t('skills.items') || 'bài'})
            </span>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="px-4 py-2 rounded-lg bg-card-dark border border-border-dark text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors flex items-center gap-1"
            >
              {t('buttons.next') || 'Sau'}
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        )}
      </section>

      {/* Right sidebar - Skill Stats + Friends, Achievements, Hot Games */}
      <aside className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-4 self-start max-h-[calc(100vh-64px)] overflow-y-auto">
        <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            {t('skills.skillStats')}
          </h3>
          <div className="space-y-4">
            {Object.entries(SKILLS).map(([key, { icon, label, color }]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                  <span className="text-sm">{t(label)}</span>
                </div>
                <span className="text-sm font-bold">
                  {key === 'reading' ? '1,240' : key === 'listening' ? '850' : '420'} XP
                </span>
              </div>
            ))}
            <div className="pt-4 border-t border-border-dark flex justify-between items-center text-xs text-gray-400">
              <span>{t('skills.weeklyTime')}: <strong className="text-white">5h 20m</strong></span>
              <span>{t('skills.done')}: <strong className="text-white">12/15</strong></span>
            </div>
          </div>
        </div>
        <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
          <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">people</span>
            {t('dashboard.friends')}
            {onlineCount > 0 && (
              <span className="text-[10px] font-medium text-green-400 flex items-center gap-0.5" title={t('userProfile.online')}>
                <span className="size-1.5 rounded-full bg-green-500" />
                {onlineCount} {t('userProfile.online')}
              </span>
            )}
            <Link
              to={ROUTES.MESSAGES}
              className="ml-auto p-1 rounded-lg text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors"
              title={t('messages.title')}
            >
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
            </Link>
          </h3>
          <div className="flex gap-1 p-1 bg-gray-700/50 rounded-lg mb-3">
            <button
              type="button"
              onClick={() => setFriendsFilterTab('all')}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${friendsFilterTab === 'all' ? 'bg-white/10 text-primary' : 'text-gray-400 hover:text-white'}`}
            >
              {t('dashboard.all')}
            </button>
            <button
              type="button"
              onClick={() => setFriendsFilterTab('online')}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${friendsFilterTab === 'online' ? 'bg-white/10 text-primary' : 'text-gray-400 hover:text-white'}`}
            >
              {t('userProfile.online')}
            </button>
          </div>
          <div className={`space-y-3 overflow-y-auto pr-1 custom-scrollbar ${displayedFriendsList.length > 5 ? 'max-h-[200px]' : ''}`}>
            {displayedFriendsList.length === 0 ? (
              <p className="text-xs text-gray-400">{t('dashboard.noFriendsOnline')}</p>
            ) : (
              displayedFriendsList.map((item) => {
                const u = item?.user || item
                const id = u?.id ?? u?._id
                const name = u?.name || 'User'
                const avatar = u?.avatar || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
                const isOnline = id != null && onlineUserIds.has(String(id))
                return (
                  <div
                    key={id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <Link to={id ? `/profile/${id}` : '#'} className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <img src={avatar} alt="" className="size-9 rounded-full object-cover" />
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-card-dark" title={t('userProfile.online')} />
                        )}
                      </div>
                      <span className="text-sm font-medium truncate">{name}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => navigate(`${ROUTES.MESSAGES}?with=${encodeURIComponent(id)}`, { state: { withUser: { id, name, avatar } } })}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors shrink-0"
                      title={t('messages.title')}
                    >
                      <span className="material-symbols-outlined text-lg">chat_bubble</span>
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
        <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
          <h3 className="font-bold text-sm mb-4">{t('enter.achievements')}</h3>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map(({ icon, color, label }) => (
              <div
                key={label}
                className="aspect-square bg-background-dark rounded-lg flex flex-col items-center justify-center border border-border-dark p-2 group cursor-help"
              >
                <span className={`material-symbols-outlined ${color} text-2xl group-hover:scale-110 transition-transform`}>{icon}</span>
                <span className="text-[8px] mt-1 text-center font-bold">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card-dark rounded-xl p-5 border border-border-dark">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-400">local_fire_department</span>
            {t('enter.hotGames')}
          </h3>
          <div className="space-y-4">
            {rawData.hotGames.map(({ id, icon, title, playing, bgColor }) => (
              <div key={id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`size-8 rounded ${bgColor || 'bg-indigo-500'} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-white text-sm">{icon || 'spellcheck'}</span>
                  </div>
                  <div className="text-[10px]">
                    <p className="font-bold">{title}</p>
                    <p className="text-gray-400">{playing} {t('enter.playing')}</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded hover:bg-primary hover:text-background-dark transition-all" type="button">
                  {t('buttons.join')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  )
}
