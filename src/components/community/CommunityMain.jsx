import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { DashboardPostCard } from '../dashboard/DashboardPostCard'

export function CommunityMain({
  onOpenCreatePost,
  posts,
  postsLoading,
  postsHasMore,
  loadMorePosts,
  onPostReactionUpdate,
  hideComposer = false,
  activeTab = 'posts',
  activeGroup = null,
  activeMembers = [],
}) {
  const { t } = useTranslation()
  const { user } = useAuth()

  const displayAvatar =
    user?.avatar ||
    (user?.name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=13b6ec&color=fff`
      : 'https://ui-avatars.com/api/?name=User&background=13b6ec&color=fff')

  // About tab: show group intro instead of posts
  if (activeTab === 'about') {
    const totalMembers = activeGroup?.memberCount ?? activeMembers.length ?? 0
    const visibleMembers = activeMembers.slice(0, 10)

    return (
      <section className="md:col-span-9 lg:col-span-6 space-y-6">
        {/* Card: mô tả dài về nhóm */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-base font-bold">
            {t('groups.main.aboutTitle', { defaultValue: 'Giới thiệu về nhóm này' })}
          </h2>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {activeGroup?.description || t('groups.sidebar.aboutEmpty')}
          </p>
        </div>

        {/* Card: Quyền riêng tư + Hiển thị */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-200">
          <div className="space-y-3">
            <div>
              <p className="font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-slate-300">public</span>
                {t('groups.sidebar.visibilityLabel', { defaultValue: 'Quyền riêng tư' })}
              </p>
              <p className="mt-1 text-slate-400">
                {activeGroup?.type === 'private'
                  ? t('groups.sidebar.privateDesc')
                  : activeGroup?.type === 'invite_only'
                    ? t('groups.sidebar.hiddenDesc')
                    : t('groups.sidebar.publicDesc')}
              </p>
            </div>
            <div>
              <p className="font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-slate-300">search</span>
                {t('groups.sidebar.searchVisibility', { defaultValue: 'Hiển thị' })}
              </p>
              <p className="mt-1 text-slate-400">
                {activeGroup?.type === 'invite_only'
                  ? t('groupsCreate.privacySearchOff', {
                      defaultValue: 'Không thể tìm thấy nhóm này.',
                    })
                  : t('groupsCreate.privacySearchOn', {
                      defaultValue: 'Ai cũng có thể tìm thấy nhóm này.',
                    })}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-slate-300">group</span>
                {t('groups.main.membersTitle', { defaultValue: 'Thành viên' })}
              </p>
              <p className="mt-1 text-slate-400">
                {(activeGroup?.memberCount ?? 0)}{' '}
                {t('groups.header.members', { defaultValue: 'thành viên' })}
              </p>
            </div>
            {activeGroup?.createdAt && (
              <div>
                <p className="font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-slate-300">history</span>
                  {t('groups.main.historyTitle', { defaultValue: 'Lịch sử' })}
                </p>
                <p className="mt-1 text-slate-400">
                  {t('groups.main.createdAt', {
                    defaultValue: 'Đã tạo nhóm vào {{date}}.',
                    date: new Date(activeGroup.createdAt).toLocaleDateString(),
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card: Thành viên nhóm (preview) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">
              {t('groups.main.membersTitle', { defaultValue: 'Thành viên' })}{' '}
              <span className="text-slate-400">
                · {totalMembers}{' '}
                {t('groups.header.members', { defaultValue: 'thành viên' })}
              </span>
            </h2>
          </div>

          <div className="h-px bg-slate-800" />

          <div className="flex flex-wrap gap-2">
            {visibleMembers.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700"
              >
                <span className="size-8 rounded-full overflow-hidden bg-slate-700">
                  {m.avatar ? (
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-slate-300 text-sm">
                      account_circle
                    </span>
                  )}
                </span>
                <span className="text-xs font-medium text-slate-100">
                  {m.name || 'Member'}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="w-full mt-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-sm font-semibold text-slate-100 text-center"
          >
            {t('groups.main.viewAllMembers', { defaultValue: 'Xem tất cả' })}
          </button>
        </div>

        {/* Card: Hoạt động (mock đơn giản theo memberCount) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-300">
          <div>
            <p className="text-slate-400">
              {t('groups.main.activityToday', { defaultValue: 'Hoạt động gần đây' })}
            </p>
            <p className="mt-1 text-lg font-bold text-slate-100">
              ~{Math.max(1, Math.round((activeGroup?.memberCount || 0) * 0.02))}
            </p>
            <p className="text-slate-500">
              {t('groups.main.activityTodayHint', { defaultValue: 'bài viết / hôm nay (ước tính)' })}
            </p>
          </div>
          <div>
            <p className="text-slate-400">
              {t('groups.main.activityMonth', { defaultValue: 'Trong tháng này' })}
            </p>
            <p className="mt-1 text-lg font-bold text-slate-100">
              ~{Math.max(5, Math.round((activeGroup?.memberCount || 0) * 0.3))}
            </p>
            <p className="text-slate-500">
              {t('groups.main.activityMonthHint', { defaultValue: 'lượt tương tác (ước tính)' })}
            </p>
          </div>
          <div>
            <p className="text-slate-400">
              {t('groups.main.membersTotal', { defaultValue: 'Tổng thành viên' })}
            </p>
            <p className="mt-1 text-lg font-bold text-slate-100">
              {activeGroup?.memberCount ?? 0}
            </p>
          </div>
          <div>
            <p className="text-slate-400">
              {t('groups.main.membersGrowth', { defaultValue: 'Ước tính tăng trưởng' })}
            </p>
            <p className="mt-1 text-lg font-bold text-slate-100">
              +{Math.max(1, Math.round((activeGroup?.memberCount || 0) * 0.05))}
            </p>
            <p className="text-slate-500">
              {t('groups.main.membersGrowthHint', { defaultValue: 'thành viên / tháng (ước tính)' })}
            </p>
          </div>
        </div>
      </section>
    )
  }

  // People tab: members preview card
  if (activeTab === 'people') {
    const totalMembers = activeGroup?.memberCount ?? activeMembers.length ?? 0
    const visible = activeMembers.slice(0, 10)

    return (
      <section className="md:col-span-9 lg:col-span-6 space-y-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">
              {t('groups.main.membersTitle', { defaultValue: 'Thành viên' })}{' '}
              <span className="text-slate-400">
                · {totalMembers}{' '}
                {t('groups.header.members', { defaultValue: 'thành viên' })}
              </span>
            </h2>
          </div>

          <div className="h-px bg-slate-800" />

          <div className="flex flex-wrap gap-2">
            {visible.map((m) => (
              <button
                key={m.id}
                type="button"
                className="flex items-center gap-2 px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                <span className="size-8 rounded-full overflow-hidden bg-slate-700">
                  {m.avatar ? (
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-slate-300 text-sm">
                      account_circle
                    </span>
                  )}
                </span>
                <span className="text-xs font-medium text-slate-100">
                  {m.name || 'Member'}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-sm font-semibold text-slate-100 text-center"
          >
            {t('groups.main.viewAllMembers', { defaultValue: 'Xem tất cả' })}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="md:col-span-9 lg:col-span-6 space-y-6">
      {!hideComposer && (
        <>
          {/* Create post */}
          <div className="bg-[#111e22] border border-[#325a67] rounded-xl p-5">
            <div className="flex gap-4">
              <img src={displayAvatar} alt="" className="size-10 rounded-full object-cover shrink-0" />
              <button
                type="button"
                onClick={onOpenCreatePost}
                className="flex-1 text-left bg-[#233f48] rounded-xl px-4 py-3 text-sm text-[#92bbc9] hover:bg-[#325a67] transition-colors"
              >
                {t('groups.main.postPlaceholder', {
                  defaultValue: 'Viết gì đó cho nhóm này...',
                })}
              </button>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#325a67]">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={onOpenCreatePost}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#233f48] rounded-lg text-xs font-medium text-[#92bbc9] transition-colors"
                >
                  <span className="material-symbols-outlined text-green-500 text-lg">image</span>
                  <span className="text-xs font-medium">
                    {t('groups.main.actionMedia', { defaultValue: 'Photo/Video' })}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onOpenCreatePost}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#233f48] rounded-lg text-xs font-medium text-[#92bbc9] transition-colors"
                >
                  <span className="material-symbols-outlined text-sky-400 text-lg">group_add</span>
                  <span className="text-xs font-medium">
                    {t('groups.main.actionTag', { defaultValue: 'Tag friends' })}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onOpenCreatePost}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#233f48] rounded-lg text-xs font-medium text-[#92bbc9] transition-colors"
                >
                  <span className="material-symbols-outlined text-yellow-400 text-lg">mood</span>
                  <span className="text-xs font-medium">
                    {t('groups.main.actionFeeling', { defaultValue: 'Feeling' })}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Posts list from dashboard feed logic */}
      {postsLoading ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center">
          <span className="material-symbols-outlined animate-spin text-3xl text-primary">
            progress_activity
          </span>
          <p className="text-sm text-slate-400 mt-2">
            {t('dashboard.loading', { defaultValue: 'Đang tải...' })}
          </p>
        </div>
      ) : !posts || posts.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-500">edit_note</span>
          <p className="text-sm text-slate-400 mt-2">
            {t('dashboard.noPosts', {
              defaultValue: 'Chưa có bài viết trong nhóm này. Hãy viết bài đầu tiên phía trên!',
            })}
          </p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <DashboardPostCard
              key={post?.id ?? post?._id}
              post={post}
              onToggleLike={onPostReactionUpdate}
            />
          ))}
          {postsHasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={loadMorePosts}
                className="px-4 py-2 text-xs font-medium text-slate-200 border border-slate-700 rounded-lg hover:bg-slate-800"
              >
                {t('dashboard.loadMore', { defaultValue: 'Tải thêm bài viết' })}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

