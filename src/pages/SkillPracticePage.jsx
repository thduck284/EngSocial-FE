import { useState, useEffect, useMemo } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { SKILLS, SKILL_TABS } from '../constants'
import { ROUTES } from '../constants'
import { DEFAULT_AVATAR } from '../constants/ui'
import { getVisiblePageNumbers } from '../utils/pagination'
import { getLessonLink } from '../utils/lesson'
import { useSkillPractices, useGuestAuthGate } from '../hooks'
import { useDashboardSocket, useDashboardFriends, useStudyGroups } from '../hooks'
import { friendsService } from '../services/friends.service'
import { userService } from '../services'
import { AlertModal } from '../components/ui/common/AlertModal'
import { CompactSelect } from '../components/ui/common/CompactSelect'
import { ENTERTAINMENT_GAMES } from '../constants/entertainmentGames'

// Stable no-op so socket effect does not re-run every render (no group conversations on skills page)
const noopSetGroupConversations = () => {}

export function SkillPracticePage() {
  const { skill = 'reading' } = useParams()
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isModerator, isGuest } = useAuth()
  const { requireAuth, guestModal } = useGuestAuthGate()
  /** Admin trên /practice như user; CRUD qua /mod (moderator). */
  const canAddPractice = isModerator

  const [onlineUserIds, setOnlineUserIds] = useState(new Set())
  const studyGroups = useStudyGroups(setOnlineUserIds)
  const [userStats, setUserStats] = useState(null)

  useEffect(() => {
    if (isGuest) return
    userService.getStats().then(res => setUserStats(res?.data)).catch(console.error)
  }, [isGuest])

  const skillStatsMap = (userStats?.skillStats || []).reduce((acc, cur) => {
    acc[cur.key] = cur
    return acc
  }, {})

  const currentSkillStat = skillStatsMap[skill] || {}
  const weeklyTimeMins = currentSkillStat.weeklyTimeSpent || 0
  const formatTimeVal = (val) => {
    const num = Number(val || 0)
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })
  }
  const weeklyTimeStr =
    weeklyTimeMins >= 60
      ? `${Math.floor(weeklyTimeMins / 60)}h ${formatTimeVal(weeklyTimeMins % 60)}m`
      : `${formatTimeVal(weeklyTimeMins)}m`
  const doneLessons = currentSkillStat.lessonsCompleted || 0

  const {
    friendsFilterTab,
    setFriendsFilterTab,
    friendTab,
    setFriendTab,
    onlineFriends,
    suggestionsList,
    sentRequestsList,
    receivedRequestsList,
    friendTabLoading,
    loadFriendTabData,
    displayedFriendsList,
    friendSelectOpen,
    setFriendSelectOpen,
    friendSelectRef,
  } = useDashboardFriends(onlineUserIds, setOnlineUserIds, studyGroups.allConversations)

  useDashboardSocket(isGuest ? null : user, studyGroups.setConversations, undefined, setOnlineUserIds)

  const activeOnlineCount = (onlineFriends || []).filter(f => f.isOnline).length

  const {
    loading,
    page,
    setPage,
    pagination,
    filterLevel,
    setFilterLevel,
    filterTopic,
    setFilterTopic,
    filterTitle,
    setFilterTitle,
    handleApplyFilters,
    handleResetFilters,
    handleDeletePractice,
    deletingId,
    rawData,
    cards,
    topicOptions,
  } = useSkillPractices(skill, t)

  const topicSelectOptions = useMemo(
    () => [
      { value: '', label: t('skills.filterAll') },
      ...topicOptions.map((topic) => ({ value: topic, label: topic })),
    ],
    [topicOptions, t]
  )

  const perPage = pagination.perPage || 6
  const rangeFrom = pagination.total > 0 ? (page - 1) * perPage + 1 : 0
  const rangeTo = pagination.total > 0 ? Math.min(page * perPage, pagination.total) : 0
  const visiblePages = useMemo(
    () => getVisiblePageNumbers(page, pagination.totalPages),
    [page, pagination.totalPages]
  )

  const blockGuestNav = (e) => {
    if (!requireAuth()) e.preventDefault()
  }

  const [itemToDelete, setItemToDelete] = useState(null)

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
        <div className="col-span-1 md:col-span-2 flex justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined animate-spin text-5xl text-primary opacity-50">progress_activity</span>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t('common.loading')}</p>
          </div>
        </div>
      )
    }

    if (cards.length === 0) {
      return (
        <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-20 px-6 rounded-[2.5rem] bg-white dark:bg-card-dark border-2 border-dashed border-slate-200 dark:border-white/10 text-center shadow-inner">
          <div className="size-20 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-gray-600">folder_off</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{t('skills.noPracticesTitle', { defaultValue: 'Chưa có bài tập nào' })}</h3>
          <p className="text-sm text-slate-500 dark:text-gray-400 max-w-xs mb-8 font-medium italic">{t('skills.emptyPractices')}</p>
          {canAddPractice && user?.id != null && (
            <Link to={ROUTES.MANAGE_SKILLS(user.id)} className="inline-flex items-center gap-3 px-8 py-3.5 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/25 hover:brightness-110 active:scale-95">
              <span className="material-symbols-outlined text-lg">add_circle</span>
              {t('skills.addPractice')}
            </Link>
          )}
        </div>
      )
    }

    const SkillCard = ({ card, skillType }) => {
      const isReadingType = skillType === 'reading'
      const isListeningType = skillType === 'listening'
      const isWritingType = skillType === 'writing'

      const detailUrl = getLessonLink({ ...card, category: 'practice', skill: skillType })
      const typeLabel = isReadingType ? t('skills.readingTask') : isListeningType ? t('skills.audioContent') : t('skills.writingTask')
      const typeIcon = isReadingType ? 'book_5' : isListeningType ? 'equalizer' : 'description'
      const overlayIcon = isReadingType ? 'visibility' : isListeningType ? 'play_circle' : 'edit_note'

      return (
        <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-border-dark overflow-hidden group hover:border-primary/50 transition-all shadow-sm hover:shadow-2xl flex flex-col h-full hover:-translate-y-1 duration-300">
          <Link
            to={detailUrl}
            onClick={blockGuestNav}
            className="flex flex-col flex-1 min-h-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-t-3xl"
          >
            <div className="h-40 bg-slate-100 dark:bg-background-dark relative overflow-hidden">
              {card.img ? (
                <img src={card.img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                  <span className="material-symbols-outlined text-6xl">{typeIcon}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <span className="material-symbols-outlined text-white text-5xl drop-shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300">{overlayIcon}</span>
              </div>
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1 shadow-lg border border-white/10">
                  <span className="material-symbols-outlined text-xs text-primary">{typeIcon}</span>
                  {typeLabel}
                </div>
              </div>
              {card.isCompleted && (
                <div className="absolute top-3 right-3 size-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-white/20">
                  <span className="material-symbols-outlined text-base font-black">check</span>
                </div>
              )}
            </div>

            <div className="p-3 pb-2 flex flex-col flex-1">
              <div className="flex justify-between items-start gap-3 mb-2">
                <h5 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {card.title}
                </h5>
                <span className={`px-2 py-0.5 ${card.levelColor} text-[9px] font-bold rounded shadow-sm shrink-0 mt-0.5`}>
                  {card.level}
                </span>
              </div>

              {isListeningType && card.accent && (
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 ${card.accentClass} text-[10px] font-bold rounded-lg border shadow-sm`}>
                    {card.accent}
                  </span>
                </div>
              )}

              {isWritingType && card.type && (
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 ${card.typeClass} text-[10px] font-bold rounded-lg border shadow-sm`}>
                    {card.type}
                  </span>
                </div>
              )}

              <p className="text-[11px] text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4 font-medium">
                {card.desc}
              </p>

              <div className="flex flex-wrap gap-2 mb-2 mt-auto">
                {card.topic && (
                  <div className="px-2 py-0.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-400 text-[9px] rounded flex items-center gap-1 border border-slate-100 dark:border-white/5">
                    <span className="material-symbols-outlined text-[10px]">category</span> {card.topic}
                  </div>
                )}
                {card.time && (
                  <div className="px-2 py-0.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-400 text-[9px] rounded flex items-center gap-1 border border-slate-100 dark:border-white/5">
                    <span className="material-symbols-outlined text-[10px]">timer</span> {card.time}
                  </div>
                )}
                {(isReadingType || isListeningType) && card.questions && (
                  <div className="px-2 py-0.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-400 text-[9px] rounded flex items-center gap-1 border border-slate-100 dark:border-white/5">
                    <span className="material-symbols-outlined text-[10px]">quiz</span> {card.questions}
                  </div>
                )}
                {isWritingType && card.length && (
                  <div className="px-2 py-0.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-400 text-[9px] rounded flex items-center gap-1 border border-slate-100 dark:border-white/5">
                    <span className="material-symbols-outlined text-[10px]">straighten</span> {card.length}
                  </div>
                )}
                {card.xpReward != null && (
                  <div className="px-2 py-0.5 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-[9px] rounded flex items-center gap-1 font-bold border border-yellow-200/50 dark:border-yellow-500/20">
                    <span className="material-symbols-outlined text-[11px] fill-icon">star</span> {card.xpReward} XP
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-1 text-[10px] text-slate-500 dark:text-gray-400">
                <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500 font-medium">
                  <span className="material-symbols-outlined text-xs fill-icon">star</span>
                  {Number(card.rating || 0).toFixed(1)}
                  <span className="text-slate-400 ml-1">
                    ({t('lessons.reviewsCount', { count: card.ratingCount || 0 })})
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">group</span>
                  {(card.completionCount ?? 0).toLocaleString()} {t('dashboard.views')}
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-slate-100 dark:border-white/5 mx-3">
              {canAddPractice && user?.id != null && card.id && (
                <>
                  <Link
                    to={`${ROUTES.MANAGE_SKILLS(user.id)}/${card.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="size-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary transition-all"
                    title={t('quests.edit')}
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setItemToDelete(card)}
                    disabled={deletingId === card.id}
                    className="size-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50"
                    title={t('quests.delete')}
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </>
              )}
              {card.id && (
                <Link
                  to={ROUTES.LESSON_REVIEWS(card.id)}
                  onClick={blockGuestNav}
                  className="size-8 flex items-center justify-center rounded-xl text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500/10 transition-all"
                  title={t('lessons.reviews') || 'Review'}
                >
                  <span className="material-symbols-outlined text-lg">star</span>
                </Link>
              )}
              <Link
                to={detailUrl}
                onClick={blockGuestNav}
                className="px-3 py-1.5 bg-primary text-white font-bold text-[10px] rounded-lg transition-all shadow-sm hover:brightness-110"
              >
                {t('dashboard.viewDetail')}
              </Link>
          </div>
        </div>
      )
    }

    if (skill === 'entertainment') {
      return ENTERTAINMENT_GAMES.map((g) => (
        <Link
          key={g.slug}
          to={g.path}
          onClick={(e) => { if (!requireAuth()) e.preventDefault() }}
          className="group relative rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-card-dark overflow-hidden hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col h-[340px]"
        >
          {/* Image Section */}
          <div className="relative h-[220px] w-full overflow-hidden shrink-0 bg-slate-100 dark:bg-background-dark">
            <img 
              src={g.image} 
              alt={t(g.titleKey)} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-card-dark via-white/20 dark:via-card-dark/40 to-transparent" />
            <div className="absolute top-4 left-4 bg-white/80 dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
              <span className="material-symbols-outlined text-primary text-base animate-pulse">public</span>
              <span className="text-[9px] font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase">Global MMO</span>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-col flex-1 px-6 pb-6 relative z-10 -mt-10">
            <div className="flex items-end justify-between mb-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors drop-shadow-sm truncate pr-2">
                {t(g.titleKey)}
              </h2>
              <div className="size-14 rounded-2xl bg-primary text-white flex items-center justify-center transition-all shadow-lg shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-110 group-active:scale-95 border border-white/20 shrink-0">
                <span className="material-symbols-outlined text-3xl ml-0.5">play_arrow</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed line-clamp-2 pr-10 font-medium italic">
              {t(g.descKey)}
            </p>
          </div>
        </Link>
      ))
    }

    if (isReading) {
      return cards.map((card) => <SkillCard key={card.id || card.title} card={card} skillType="reading" />)
    }
    if (isListening) {
      return cards.map((card) => <SkillCard key={card.id || card.title} card={card} skillType="listening" />)
    }
    if (isWriting) {
      return cards.map((card) => <SkillCard key={card.id || card.title} card={card} skillType="writing" />)
    }
    return null
  }


  return (

    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-6 pt-2 px-6 pb-6">
      {/* Left sidebar - Add practice + Tabs + Filters + Goals + Roadmap */}
      <aside className="col-span-12 lg:col-span-3 space-y-5 lg:sticky lg:top-2 self-start max-h-[calc(100vh-80px)] lg:overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
          <Link
            to={ROUTES.LESSON_HISTORY}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white dark:bg-card-dark hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-white font-bold rounded-xl text-xs transition-all border border-slate-200 dark:border-border-dark shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">history</span>
            {t('lessons.viewHistory')}
          </Link>
          {canAddPractice && user?.id != null && (
            <Link
              to={ROUTES.MANAGE_SKILLS(user.id)}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-black rounded-xl text-xs transition-all shadow-lg shadow-primary/25"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              {t('skills.addPractice')}
            </Link>
          )}

          <Link
            to="/practice/mock-test"
            onClick={(e) => { if (!requireAuth()) e.preventDefault() }}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs transition-all shadow-xl shadow-indigo-900/20 border border-indigo-400/30 group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">school</span>
            {t('skills.mockTest')}
          </Link>
          <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
            <div className="grid grid-cols-2 gap-1.5 p-2">
              {SKILL_TABS.map(({ to, icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`py-2 px-1.5 rounded-lg text-[10px] font-black flex flex-col items-center justify-center gap-1 transition-all min-w-0 border ${
                    pathname === to || (to === ROUTES.SKILLS.ENTERTAINMENT && pathname.startsWith(`${ROUTES.SKILLS.ENTERTAINMENT}/`))
                      ? 'bg-primary/10 text-primary border-primary/40 shadow-inner'
                      : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg shrink-0">{icon}</span>
                  <span className="truncate">{t(label)}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark p-5 space-y-5 shadow-sm">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">filter_list</span>
              {t('skills.filters')}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 px-1 tracking-wider">{t('skills.filterTitle') || 'Tìm kiếm theo tên bài'}</label>
                <input
                  type="text"
                  value={filterTitle}
                  onChange={(e) => setFilterTitle(e.target.value)}
                  placeholder={t('skills.filterTitlePlaceholder') || 'Nhập từ khóa...'}
                  className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-xs rounded-xl focus:ring-2 focus:ring-primary outline-none px-3 py-2 text-slate-900 dark:text-white transition-all shadow-sm placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 px-1 tracking-wider">{t('skills.filterLevel')}</label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-xs rounded-xl focus:ring-2 focus:ring-primary outline-none px-3 py-2 text-slate-900 dark:text-white transition-all shadow-sm"
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
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 px-1 tracking-wider">{t('skills.filterTopic')}</label>
                <CompactSelect
                  value={filterTopic}
                  onChange={setFilterTopic}
                  options={topicSelectOptions}
                  placement="up"
                  className="w-full"
                  buttonClassName="bg-slate-50 dark:bg-background-dark text-xs"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleResetFilters} type="button" className="flex-1 py-2 text-[10px] font-black text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark transition-all shadow-sm">
                {t('buttons.reset')}
              </button>
              <button onClick={handleApplyFilters} type="button" className="flex-1 py-2 bg-primary text-white font-black text-[10px] rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                {t('buttons.save')}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Center - challenge + cards */}
      <section className="col-span-12 lg:col-span-6 space-y-6">
        <div className={`bg-gradient-to-r ${challengeGradient} to-primary/20 border border-primary/30 rounded-2xl p-6 relative overflow-hidden shadow-lg`}>
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-3 max-w-[70%]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-black rounded shadow-sm uppercase tracking-wider">{t('enter.weeklyChallenge')}</span>
                <span className="text-xs text-primary font-bold flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-sm">schedule</span> {challenge.time}
                </span>
              </div>
              <h4 className="font-black text-lg text-white leading-tight drop-shadow-md">{challenge.title}</h4>
              <p className="text-[11px] text-white/80 leading-relaxed font-medium">{challenge.desc}</p>
              <Link
                to="/challenge"
                className="mt-2 px-6 py-2 bg-white text-primary font-black text-xs rounded-xl hover:bg-slate-50 transition-all shadow-lg inline-block"
              >
                {t(challenge.btn)}
              </Link>
            </div>
            <span className="material-symbols-outlined text-[100px] text-white/10 absolute -right-4 -bottom-4 rotate-12">{challengeIcon}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{renderCards()}</div>

        {skill !== 'entertainment' && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 pb-2">
            <p className="text-xs text-slate-500 dark:text-gray-400 text-center sm:text-left">
              {t('skills.paginationRange', { from: rangeFrom, to: rangeTo, total: pagination.total })}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark text-xs font-black text-slate-700 dark:text-slate-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-700 transition-all"
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
                    className={`min-w-[2.25rem] px-2.5 py-2 rounded-xl text-xs font-black border transition-all ${
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
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark text-xs font-black text-slate-700 dark:text-slate-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-700 transition-all"
              >
                {t('buttons.next') || 'Sau'}
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 text-center sm:text-right">
              {t('skills.paginationPage', { current: page, total: pagination.totalPages })}
            </p>
          </div>
        )}
      </section>

      {/* Right sidebar - Skill Stats + Friends, Achievements, Hot Games */}
      <aside className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-2 self-start max-h-[calc(100vh-80px)] lg:overflow-y-auto pr-2 custom-scrollbar">
        <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-border-dark shadow-sm">
          <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">analytics</span>
            {t('skills.skillStats')}
          </h3>
          <div className="space-y-4">
            {Object.entries(SKILLS).map(([key, { icon, label, color }]) => (
              <div key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${color} text-xl`}>{icon}</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t(label)}</span>
                </div>
                <span className="font-black text-xs text-primary">
                  {(skillStatsMap[key]?.totalXpEarned || 0).toLocaleString()} XP
                </span>
              </div>
            ))}
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-border-dark flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{t('skills.weeklyTime')}: <strong className="text-slate-900 dark:text-white">{weeklyTimeStr}</strong></span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span>{t('skills.done')}: <strong className="text-slate-900 dark:text-white">{doneLessons}</strong></span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-border-dark shadow-sm">
          <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">people</span>
            {t('dashboard.friends')}
            {activeOnlineCount > 0 && (
              <span className="text-[10px] font-black text-green-500 flex items-center gap-0.5" title={t('userProfile.online')}>
                <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                {activeOnlineCount} {t('userProfile.online')}
              </span>
            )}
            <Link
              to={ROUTES.MESSAGES}
              className="ml-auto p-1 rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors"
              title={t('messages.title')}
            >
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
            </Link>
          </h3>
          <div className="flex gap-1 p-1 bg-slate-50 dark:bg-background-dark/50 rounded-lg mb-4 border border-slate-100 dark:border-border-dark shadow-inner">
            <button
              type="button"
              onClick={() => setFriendsFilterTab('all')}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${friendsFilterTab === 'all' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              {t('dashboard.all')}
            </button>
            <button
              type="button"
              onClick={() => setFriendsFilterTab('online')}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${friendsFilterTab === 'online' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              {t('userProfile.online')}
            </button>
          </div>
          <div className={`space-y-2 overflow-y-auto pr-1 custom-scrollbar ${displayedFriendsList.length > 5 ? 'max-h-[220px]' : ''}`}>
            {displayedFriendsList.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-gray-500 py-6 text-center font-medium italic">{t('dashboard.noFriendsOnline')}</p>
            ) : (
              displayedFriendsList.map((item) => {
                const u = item?.user || item
                const id = u?.id ?? u?._id
                const name = u?.name || 'User'
                const avatar = u?.avatar || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
                const isOnline = item.isOnline
                return (
                  <div
                    key={id}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                  >
                    <Link to={id ? `/profile/${id}` : '#'} className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <img src={avatar} alt="" className="size-9 rounded-full object-cover border border-slate-200 dark:border-border-dark shadow-sm" />
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-white dark:border-card-dark" title={t('userProfile.online')} />
                        )}
                      </div>
                      <span className="text-sm font-medium truncate text-slate-700 dark:text-gray-200 group-hover:text-primary transition-colors">{name}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => navigate(`${ROUTES.MESSAGES}?with=${encodeURIComponent(id)}`, { state: { withUser: { id, name, avatar } } })}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-all shrink-0"
                      title={t('messages.title')}
                    >
                      <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-border-dark shadow-sm">
          <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500">local_fire_department</span>
            {t('enter.hotGames')}
          </h3>
          <div className="space-y-4">
            {ENTERTAINMENT_GAMES.map((g, idx) => (
              <div key={g.slug} className="flex items-center justify-between gap-2 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`size-10 rounded-xl shrink-0 ${idx === 0 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'} flex items-center justify-center relative overflow-hidden border border-slate-200 dark:border-white/5`}>
                    <img src={g.image} alt={t(g.titleKey)} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-50 transition-opacity" />
                    <span className="material-symbols-outlined text-[18px] relative z-10">{g.icon}</span>
                  </div>
                  <div className="text-[11px] min-w-0">
                    <p className="font-bold truncate text-slate-900 dark:text-white group-hover:text-primary transition-colors">{t(g.titleKey)}</p>
                    <p className="text-slate-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Global MMO
                    </p>
                  </div>
                </div>
                <Link
                  to={g.path}
                  className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold rounded-lg hover:bg-primary hover:text-white transition-all shrink-0"
                >
                  {t('buttons.join')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <AlertModal
        open={!!itemToDelete}
        title={t('manageLessons.deleteConfirmTitle') || t('quests.delete')}
        message={t('skills.confirmDeletePractice', { title: itemToDelete?.title || '' })}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            handleDeletePractice(itemToDelete, '')
            setItemToDelete(null)
          }
        }}
      />
      {guestModal}
    </main>
  )
}

