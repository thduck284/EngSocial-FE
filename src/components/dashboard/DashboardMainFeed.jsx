import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CreatePostModal } from '../CreatePostModal'
import { StudyGroupsModal } from './StudyGroupsModal'
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
  studyGroups,
  suggestedGroups,
  postsLoading,
  posts,
  postsLoadingMore = false,
  hasMorePosts = false,
  loadMorePosts,
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

      <StudyGroupsModal
        open={studyGroups.showStudyGroupsModal}
        onClose={() => studyGroups.setShowStudyGroupsModal(false)}
        groupConversations={studyGroups.groupConversations}
        groupConversationsLoading={studyGroups.groupConversationsLoading}
        suggestedGroups={suggestedGroups}
      />

      <div className="flex items-center gap-4 bg-white/50 dark:bg-transparent p-1 rounded-xl">
        <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-[#111e22] rounded-xl border border-slate-200 dark:border-[#325a67]">
          <button className="px-6 py-2 bg-white dark:bg-[#233f48] rounded-lg text-sm font-bold shadow-sm">
            {t('dashboard.all')}
          </button>
          <button className="px-6 py-2 hover:bg-white/50 dark:hover:bg-[#233f48]/50 rounded-lg text-sm font-medium text-slate-500 dark:text-[#92bbc9]">
            {t('dashboard.following')}
          </button>
          <button className="px-6 py-2 hover:bg-white/50 dark:hover:bg-[#233f48]/50 rounded-lg text-sm font-medium text-slate-500 dark:text-[#92bbc9]">
            {t('dashboard.popular')}
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-[#92bbc9] cursor-pointer">
          {t('dashboard.newest')} <span className="material-symbols-outlined text-lg">expand_more</span>
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
              onToggleLike={onPostReactionUpdate}
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
