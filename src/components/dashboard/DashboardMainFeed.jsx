import { useRef, useEffect } from 'react'
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
}) {
  const { t } = useTranslation()
  const loadMoreRef = useRef(null)

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
          {posts.map((post, index) => (
            <DashboardPostCard
              key={post?.id ?? post?._id ?? `post-${index}`}
              post={post}
              useHomeCommunityStyle
              onToggleLike={onPostReactionUpdate}
              onUpdatePost={onPostUpdate}
              onDeletePost={onPostDelete}
            />
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

      <div className="flex items-center gap-4 py-2">
        <div className="h-[1px] flex-1 bg-slate-200 dark:bg-[#325a67]" />
        <span className="text-[10px] font-bold text-slate-500 dark:text-[#92bbc9] uppercase tracking-widest">
          {t('dashboard.suggestedLessons')}
        </span>
        <div className="h-[1px] flex-1 bg-slate-200 dark:bg-[#325a67]" />
      </div>
      <Link
        to="/lesson"
        className="block bg-gradient-to-br from-[#111e22] to-[#1a353d] dark:from-[#111e22] dark:to-[#1a353d] rounded-xl border border-primary/30 p-5 relative overflow-hidden group hover:border-primary/50 transition-colors"
      >
        <div className="relative z-10 flex gap-6">
          <div
            className="w-1/3 aspect-video rounded-lg bg-cover bg-center shrink-0"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDKqQRcZ2qEUm_G9civhe_WEXiHigCQOkb56jFE6xSQfjLEgB0aZByKocBA4xPNZtFhRTG5TuqjG1kogq3KdZD8cfD6VINztDQdUM2TAwY9Yn8HNzzMjl5yzHc7Eo5SkMYsiTiC4t_f5lxm-nTX1rNn7IXUmFieoc2KhtrWo9kc6a9H8sw20XyDiswbiBiG62iFjYbKEQB7Q63k7DzND2sbrO4hI5jhmTwYkzUtLGuY2cCIhPb8rZ-OelYJqRfAU20NTYUtHW7CqXmW')`,
            }}
          />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary text-[#111e22] text-[10px] font-bold rounded">{t('dashboard.featured')}</span>
              <span className="text-xs text-primary font-medium">{t('dashboard.by')} {t('dashboard.team')}</span>
            </div>
            <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
              Mastering Business English: Email Etiquette
            </h4>
            <p className="text-xs text-slate-400 dark:text-[#92bbc9] line-clamp-2">
              Nâng tầm kỹ năng viết email chuyên nghiệp với bộ quy tắc giao tiếp công sở hiện đại...
            </p>
            <div className="flex items-center gap-4 pt-2">
              <span className="px-4 py-1.5 bg-primary text-[#111e22] font-bold text-xs rounded-lg">
                {t('dashboard.learnNow')}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-[#92bbc9] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span> 15 {t('dashboard.minutes')}
              </span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
      </Link>
    </section>
  )
}
