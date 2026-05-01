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
        className="block bg-gradient-to-br from-[#111e22] to-[#1a353d] dark:from-[#111e22] dark:to-[#1a353d] rounded-xl border border-primary/30 p-5 relative overflow-hidden group hover:border-primary/50 transition-colors"
      >
        <div className="relative z-10 flex gap-6">
          <div
            className="w-1/3 aspect-video rounded-lg bg-cover bg-center shrink-0 bg-slate-800"
            style={{
              backgroundImage: lesson.thumbnail ? `url('${lesson.thumbnail}')` : undefined,
            }}
          >
            {!lesson.thumbnail && (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-600 text-3xl">school</span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary text-[#111e22] text-[10px] font-bold rounded">
                {t('dashboard.featured')}
              </span>
              <span className="text-xs text-primary font-medium">
                {t('dashboard.by')} {t('dashboard.team')}
              </span>
              {lesson.level && (
                <span className="px-1.5 py-0.5 bg-white/10 text-white text-[10px] font-medium rounded border border-white/20 uppercase">
                  {lesson.level}
                </span>
              )}
            </div>
            <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors truncate">
              {lesson.title}
            </h4>
            <p className="text-xs text-slate-400 dark:text-[#92bbc9] line-clamp-2">
              {lesson.description || t('dashboard.lessonDescriptionFallback') || 'Nâng cao kỹ năng của bạn với bài học chất lượng cao từ đội ngũ chuyên gia...'}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <span className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 font-bold text-xs rounded-lg group-hover:bg-primary group-hover:text-[#111e22] transition-all">
                {t('dashboard.viewDetail')}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-[#92bbc9] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span> {lesson.estimatedTime || 15} {t('dashboard.minutes')}
              </span>
              {lesson.skill && (
                <span className="text-[10px] text-slate-400 dark:text-[#92bbc9] flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    {lesson.skill === 'reading' ? 'menu_book' : lesson.skill === 'listening' ? 'headphones' : 'edit_note'}
                  </span>
                  {t(`skills.${lesson.skill}`) || lesson.skill}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
      </Link>
    )
  }

  return (
    <section className="col-span-12 lg:col-span-6 space-y-6">
      <div className="bg-white dark:bg-[#111e22] rounded-xl p-5 border border-slate-200 dark:border-[#325a67]">
        <div className="flex gap-4">
          <img src={displayAvatar} alt="" className="size-10 rounded-full object-cover shrink-0" />
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex-1 text-left bg-slate-50 dark:bg-[#233f48] rounded-xl px-4 py-3 text-sm text-slate-400 dark:text-[#92bbc9] hover:bg-slate-100 dark:hover:bg-[#325a67] transition-colors"
          >
            {t('dashboard.postPlaceholder')}
          </button>
        </div>
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-[#325a67]">
          <div className="flex gap-1">
            <button type="button" onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-lg text-xs font-medium text-slate-500 dark:text-[#92bbc9] transition-colors">
              <span className="material-symbols-outlined text-green-500 text-lg">image</span> {t('dashboard.image')}
            </button>
            <button type="button" onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-lg text-xs font-medium text-slate-500 dark:text-[#92bbc9] transition-colors">
              <span className="material-symbols-outlined text-red-500 text-lg">videocam</span> {t('dashboard.video')}
            </button>
            <button type="button" onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#233f48] rounded-lg text-xs font-medium text-slate-500 dark:text-[#92bbc9] transition-colors">
              <span className="material-symbols-outlined text-blue-500 text-lg">description</span> {t('dashboard.document')}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:brightness-110 transition-all"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => studyGroups.setShowStudyGroupsModal(false)}
        >
          <div
            className="bg-white dark:bg-[#111e22] rounded-2xl border border-slate-200 dark:border-[#325a67] shadow-xl w-full max-w-md max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#325a67] shrink-0">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">groups</span>
                {t('dashboard.studyGroups')}
              </h2>
              <button
                type="button"
                onClick={() => studyGroups.setShowStudyGroupsModal(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#233f48] dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 flex flex-col min-h-[200px]">
              {studyGroups.groupConversationsLoading ? (
                <div className="py-8 flex justify-center">
                  <span className="material-symbols-outlined animate-spin text-3xl text-primary">
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
                          className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-[#325a67] hover:bg-slate-50 dark:hover:bg-[#233f48] transition-colors"
                        >
                          <div className="relative shrink-0">
                            <img src={avatar} alt="" className="size-10 rounded-lg object-cover" />
                            {isGroupOnline && (
                              <span
                                className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#111e22]"
                                title={t('userProfile.online')}
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate">{name}</p>
                            {membersLabel && (
                              <p className="text-xs text-slate-500 dark:text-[#92bbc9]">
                                {membersLabel}
                              </p>
                            )}
                          </div>
                          <span
                            className="material-symbols-outlined text-slate-400 text-lg shrink-0"
                            aria-hidden="true"
                          >
                            chat_bubble
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                  {studyGroups.groupConversations.length === 0 &&
                    suggestedGroups?.length > 0 && (
                      <div className="space-y-3">
                        {suggestedGroups.slice(0, 3).map((g, idx) => (
                          <div
                            key={g.title || idx}
                            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-[#325a67] bg-slate-50/50 dark:bg-[#233f48]/30"
                          >
                            <div
                              className={`size-10 rounded-lg ${
                                g.color || 'bg-primary/20'
                              } flex items-center justify-center shrink-0`}
                            >
                              <span className="material-symbols-outlined text-white text-xl">
                                {g.icon || 'groups'}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm truncate">{g.title}</p>
                              <p className="text-xs text-slate-500 dark:text-[#92bbc9]">
                                {g.members}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  {studyGroups.groupConversations.length === 0 &&
                    (!suggestedGroups || suggestedGroups.length === 0) && (
                      <p className="text-sm text-slate-500 dark:text-[#92bbc9] py-4 text-center">
                        {t('dashboard.noStudyGroups')}
                      </p>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 bg-white/50 dark:bg-transparent p-1 rounded-xl">
        <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-[#111e22] rounded-xl border border-slate-200 dark:border-[#325a67]">
          <button
            type="button"
            onClick={() => setFeedTab?.('all')}
            className={`px-6 py-2 rounded-lg text-sm font-bold shadow-sm transition-all ${
              feedTab === 'all'
                ? 'bg-white dark:bg-[#233f48] text-primary'
                : 'text-slate-500 dark:text-[#92bbc9] hover:bg-white/30 dark:hover:bg-[#233f48]/50'
            }`}
          >
            {t('dashboard.all')}
          </button>
          <button
            type="button"
            onClick={() => setFeedTab?.('following')}
            className={`px-6 py-2 rounded-lg text-sm font-bold shadow-sm transition-all ${
              feedTab === 'following'
                ? 'bg-white dark:bg-[#233f48] text-primary'
                : 'text-slate-500 dark:text-[#92bbc9] hover:bg-white/30 dark:hover:bg-[#233f48]/50'
            }`}
          >
            {t('dashboard.following')}
          </button>
          <button
            type="button"
            onClick={() => setFeedTab?.('popular')}
            className={`px-6 py-2 rounded-lg text-sm font-bold shadow-sm transition-all ${
              feedTab === 'popular'
                ? 'bg-white dark:bg-[#233f48] text-primary'
                : 'text-slate-500 dark:text-[#92bbc9] hover:bg-white/30 dark:hover:bg-[#233f48]/50'
            }`}
          >
            {t('dashboard.popular')}
          </button>
        </div>
      </div>

      {postsLoading ? (
        <div className="bg-white dark:bg-[#111e22] rounded-xl border border-slate-200 dark:border-[#325a67] p-8 text-center">
          <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
          <p className="text-sm text-slate-500 dark:text-[#92bbc9] mt-2">{t('dashboard.loading') || 'Đang tải...'}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-[#111e22] rounded-xl border border-slate-200 dark:border-[#325a67] p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-[#92bbc9]">edit_note</span>
          <p className="text-sm text-slate-500 dark:text-[#92bbc9] mt-2">{t('dashboard.noPosts') || 'Chưa có bài viết. Hãy viết bài đầu tiên phía trên!'}</p>
        </div>
      ) : (
        <>
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
          {hasMorePosts && <div ref={loadMoreRef} className="h-4 min-h-[1rem]" aria-hidden />}
          {postsLoadingMore && (
            <div className="bg-white dark:bg-[#111e22] rounded-xl border border-slate-200 dark:border-[#325a67] py-6 text-center">
              <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
              <p className="text-xs text-slate-500 dark:text-[#92bbc9] mt-2">{t('dashboard.loading') || 'Đang tải...'}</p>
            </div>
          )}
        </>
      )}
    </section>
  )
}
