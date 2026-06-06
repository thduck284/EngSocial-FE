import React, { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants'
import { DEFAULT_AVATAR } from '../../constants/ui'
import { CreatePostModal } from '../ui/post/CreatePostModal'
import { DashboardPostCard } from './DashboardPostCard'

/**
 * Main feed: composer, create post modal, study groups modal, feed tabs, posts list (infinite scroll), suggested lessons CTA.
 */
export function DashboardMainFeed({
  displayAvatar,
  showCreateModal,
  setShowCreateModal,
  handlePostFromModal,
  onPostReactionUpdate,
  onPostUpdate,
  onPostDelete,
  studyGroups,
  suggestedGroups,
  postsLoading,
  posts,
  postsLoadingMore = false,
  hasMorePosts = false,
  loadMorePosts,
  feedTab = 'all',
  setFeedTab,
  friendsList = [],
  featuredLessons = [],
}) {
  const { t } = useTranslation()
  const loadMoreRef = useRef(null)

  // Interleave posts and featured lessons
  const combinedFeed = React.useMemo(() => {
    const result = []
    let postsCount = 0
    let lessonIdx = 0

    // Sequence of gaps: first gap is 4, then subsequent are 7-10
    const getGap = (i) => {
      if (i === 0) return 4 
      return 7 + ([0, 3, 1, 2][i % 4])
    }
    let nextGap = getGap(lessonIdx)

    posts.forEach((post) => {
      result.push({ type: 'post', content: post })
      postsCount++

      if (postsCount === nextGap && featuredLessons.length > 0) {
        result.push({
          type: 'lesson',
          content: featuredLessons[lessonIdx % featuredLessons.length],
        })
        lessonIdx++
        postsCount = 0
        nextGap = getGap(lessonIdx)
      }
    })
    return result
  }, [posts, featuredLessons])

  // Infinite scroll: load more when sentinel reaches viewport
  useEffect(() => {
    if (!loadMorePosts || !hasMorePosts || postsLoadingMore) return
    const el = loadMoreRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMorePosts()
      },
      { rootMargin: '100px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMorePosts, hasMorePosts, postsLoadingMore])

  const renderLessonCard = (lesson, isEnd = false) => {
    if (!lesson) return null
    const skill = lesson.skill || 'reading'
    const category = lesson.category || 'lesson'
    const slug = lesson.slug || lesson.id || lesson._id
    const targetUrl = `/${category}/${skill}/${slug}`

    return (
      <Link
        to={targetUrl}
        className="block bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#111e22] dark:to-[#1a353d] rounded-2xl border border-slate-200 dark:border-primary/30 p-5 relative overflow-hidden group hover:border-primary/60 transition-all shadow-lg hover:shadow-primary/10"
      >
        <div className="relative z-10 flex flex-col md:flex-row gap-6">
          <div
            className="w-full md:w-1/3 aspect-video rounded-xl bg-cover bg-center shrink-0 bg-slate-200 dark:bg-slate-800 shadow-inner overflow-hidden border border-slate-200 dark:border-transparent"
            style={{
              backgroundImage: lesson.thumbnail ? `url('${lesson.thumbnail}')` : undefined,
            }}
          >
            {!lesson.thumbnail && (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 text-3xl">school</span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-black rounded shadow-sm uppercase tracking-wider">
                {t('dashboard.featured')}
              </span>
              <span className="text-xs text-primary font-black uppercase tracking-tighter">
                {t('dashboard.by')} {t('dashboard.team')}
              </span>
              {lesson.level && (
                <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white text-[10px] font-black rounded border border-slate-300 dark:border-white/20 uppercase">
                  {lesson.level}
                </span>
              )}
            </div>
            <h4 className="font-black text-xl leading-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
              {lesson.title}
            </h4>
            <p className="text-sm text-slate-500 dark:text-[#92bbc9] line-clamp-2 font-medium">
              {lesson.description || t('dashboard.lessonDescriptionFallback') || 'Nâng cao kỹ năng của bạn với bài học chất lượng cao từ đội ngũ chuyên gia...'}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <span className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 font-black text-xs rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                {t('dashboard.viewDetail')}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-[#92bbc9] flex items-center gap-1.5 font-black uppercase tracking-wider">
                <span className="material-symbols-outlined text-lg">schedule</span> {lesson.estimatedTime || 15} {t('dashboard.minutes')}
              </span>
              {lesson.skill && (
                <span className="text-[11px] text-slate-400 dark:text-[#92bbc9] flex items-center gap-1.5 font-black uppercase tracking-wider">
                  <span className="material-symbols-outlined text-lg text-primary/60">
                    {lesson.skill === 'reading' ? 'menu_book' : lesson.skill === 'listening' ? 'headphones' : 'edit_note'}
                  </span>
                  {t(`skills.${lesson.skill}`) || lesson.skill}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16 blur-3xl opacity-50 dark:opacity-100" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-12 -translate-x-12 blur-2xl opacity-50 dark:opacity-100" />
      </Link>
    )
  }

  return (
    <section className="col-span-12 lg:col-span-6 space-y-6">
      <div className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-slate-200 dark:border-border-dark shadow-sm">
        <div className="flex gap-4">
          <div className="relative shrink-0">
            <img src={displayAvatar} alt="" className="size-10 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800 shadow-sm" />
            <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white dark:border-card-dark shadow-sm" />
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex-1 text-left bg-slate-50 dark:bg-background-dark rounded-2xl px-5 py-3 text-sm text-slate-400 dark:text-[#92bbc9] hover:bg-slate-100 dark:hover:bg-white/10 transition-all font-medium border border-slate-100 dark:border-transparent"
          >
            {t('dashboard.postPlaceholder')}
          </button>
        </div>
        <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-border-dark">
          <div className="flex gap-1">
            <button type="button" onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-xs font-black text-slate-600 dark:text-[#92bbc9] transition-all group">
              <span className="material-symbols-outlined text-green-500 text-xl group-hover:scale-110 transition-transform">image</span> {t('dashboard.image')}
            </button>
            <button type="button" onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-xs font-black text-slate-600 dark:text-[#92bbc9] transition-all group">
              <span className="material-symbols-outlined text-red-500 text-xl group-hover:scale-110 transition-transform">videocam</span> {t('dashboard.video')}
            </button>
            <button type="button" onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-xs font-black text-slate-600 dark:text-[#92bbc9] transition-all group">
              <span className="material-symbols-outlined text-blue-500 text-xl group-hover:scale-110 transition-transform">description</span> {t('dashboard.document')}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2.5 bg-primary text-white font-black text-sm rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            {t('dashboard.createPost') || 'Tạo bài viết'}
          </button>
        </div>
      </div>

      <CreatePostModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handlePostFromModal}
        friendsList={friendsList}
      />

      {studyGroups.showStudyGroupsModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => studyGroups.setShowStudyGroupsModal(false)}
        >
          <div
            className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-border-dark shrink-0">
              <h2 className="font-black text-lg flex items-center gap-3 uppercase tracking-wider text-slate-900 dark:text-white">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-2xl">groups</span>
                {t('dashboard.studyGroups')}
              </h2>
              <button
                type="button"
                onClick={() => studyGroups.setShowStudyGroupsModal(false)}
                className="size-10 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-white transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 flex flex-col min-h-[200px]">
              {studyGroups.groupConversationsLoading ? (
                <div className="py-12 flex justify-center">
                  <span className="material-symbols-outlined animate-spin text-4xl text-primary opacity-50">
                    progress_activity
                  </span>
                </div>
              ) : (
                <>
                  <div
                    className={`space-y-3 overflow-y-auto pr-1 custom-scrollbar ${
                      studyGroups.groupConversations.length > 5 ? 'max-h-[50vh]' : ''
                    }`}
                  >
                    {studyGroups.groupConversations.map((c) => {
                      const convId = c.id ?? c._id
                      const name = c.name || t('dashboard.studyGroups')
                      const avatar =
                        c.avatar ||
                        (name
                          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              name
                            )}&background=13b6ec&color=fff`
                          : DEFAULT_AVATAR)
                      const membersLabel =
                        c.memberCount != null ? `${c.memberCount} ${t('dashboard.members')}` : ''
                      const isGroupOnline = c.online === true
                      return (
                        <Link
                          key={convId}
                          to={ROUTES.MESSAGES_CONVERSATION(convId)}
                          onClick={() => studyGroups.setShowStudyGroupsModal(false)}
                          className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-border-dark bg-slate-50/50 dark:bg-background-dark/50 hover:bg-white dark:hover:bg-white/5 hover:border-primary/40 dark:hover:border-primary/40 transition-all group shadow-sm"
                        >
                          <div className="relative shrink-0">
                            <img src={avatar} alt="" className="size-12 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform" />
                            {isGroupOnline && (
                              <span
                                className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white dark:border-[#111e22]"
                                title={t('userProfile.online')}
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-black text-sm text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{name}</p>
                            {membersLabel && (
                              <p className="text-xs font-bold text-slate-400 dark:text-[#92bbc9] mt-0.5 uppercase tracking-tighter">
                                {membersLabel}
                              </p>
                            )}
                          </div>
                          <span
                            className="material-symbols-outlined text-slate-400 text-xl shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                            aria-hidden="true"
                          >
                            arrow_forward_ios
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                  {studyGroups.groupConversations.length === 0 &&
                    suggestedGroups?.length > 0 && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 px-1">{t('dashboard.suggestedGroups') || 'Gợi ý cho bạn'}</p>
                        {suggestedGroups.slice(0, 3).map((g, idx) => (
                          <div
                            key={g.title || idx}
                            className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-white/5 shadow-sm"
                          >
                            <div
                              className={`size-12 rounded-2xl ${
                                g.color || 'bg-primary/20'
                              } flex items-center justify-center shrink-0 shadow-inner`}
                            >
                              <span className="material-symbols-outlined text-white text-2xl">
                                {g.icon || 'groups'}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-black text-sm text-slate-900 dark:text-white truncate">{g.title}</p>
                              <p className="text-xs font-bold text-slate-400 dark:text-[#92bbc9] mt-0.5 uppercase tracking-tighter">
                                {g.members}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  {studyGroups.groupConversations.length === 0 &&
                    (!suggestedGroups || suggestedGroups.length === 0) && (
                      <div className="py-12 flex flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-gray-700 mb-4">group_off</span>
                        <p className="text-sm font-bold text-slate-500 dark:text-[#92bbc9]">
                          {t('dashboard.noStudyGroups')}
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-0.5 p-1 rounded-lg w-1/2 min-w-[220px] bg-white dark:bg-card-dark border border-slate-100 dark:border-border-dark">
        <button
          type="button"
          onClick={() => setFeedTab?.('all')}
          className={`flex-1 min-w-0 px-2 py-1.5 rounded-md text-xs font-bold transition-all ${
            feedTab === 'all'
              ? 'bg-primary text-white'
              : 'text-slate-500 dark:text-[#92bbc9] hover:bg-slate-50 dark:hover:bg-white/5'
          }`}
        >
          {t('dashboard.all')}
        </button>
        <button
          type="button"
          onClick={() => setFeedTab?.('following')}
          className={`flex-1 min-w-0 px-2 py-1.5 rounded-md text-xs font-bold transition-all ${
            feedTab === 'following'
              ? 'bg-primary text-white'
              : 'text-slate-500 dark:text-[#92bbc9] hover:bg-slate-50 dark:hover:bg-white/5'
          }`}
        >
          {t('dashboard.following')}
        </button>
        <button
          type="button"
          onClick={() => setFeedTab?.('popular')}
          className={`flex-1 min-w-0 px-2 py-1.5 rounded-md text-xs font-bold transition-all ${
            feedTab === 'popular'
              ? 'bg-primary text-white'
              : 'text-slate-500 dark:text-[#92bbc9] hover:bg-slate-50 dark:hover:bg-white/5'
          }`}
        >
          {t('dashboard.popular')}
        </button>
      </div>

      {postsLoading ? (
        <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark p-12 text-center shadow-sm">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary opacity-50">progress_activity</span>
          <p className="text-sm font-black text-slate-500 dark:text-[#92bbc9] mt-4 uppercase tracking-widest">{t('dashboard.loading') || 'Đang tải...'}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-card-dark rounded-3xl border-2 border-dashed border-slate-200 dark:border-border-dark p-16 text-center shadow-sm">
          <div className="size-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-gray-700">edit_note</span>
          </div>
          <p className="text-sm font-black text-slate-500 dark:text-[#92bbc9] max-w-xs mx-auto">{t('dashboard.noPosts') || 'Chưa có bài viết. Hãy viết bài đầu tiên phía trên!'}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {combinedFeed.map((item, index) => (
              <React.Fragment key={item.type === 'post' ? (item.content?.id ?? item.content?._id ?? `p-${index}`) : `l-${index}`}>
                {item.type === 'post' ? (
                  <DashboardPostCard
                    post={item.content}
                    useHomeCommunityStyle
                    onToggleLike={onPostReactionUpdate}
                    onUpdatePost={onPostUpdate}
                    onDeletePost={onPostDelete}
                  />
                ) : (
                  renderLessonCard(item.content)
                )}
              </React.Fragment>
            ))}
          </div>
          {hasMorePosts && <div ref={loadMoreRef} className="h-4 min-h-[1rem]" aria-hidden />}
          {postsLoadingMore && (
            <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark py-8 text-center shadow-sm">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary opacity-50">progress_activity</span>
              <p className="text-xs font-black text-slate-500 dark:text-[#92bbc9] mt-3 uppercase tracking-widest">{t('dashboard.loading') || 'Đang tải...'}</p>
            </div>
          )}
        </>
      )}
    </section>

  )
}
