import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { DEFAULT_AVATAR } from '../../constants/ui'
import { DashboardPostCard } from '../dashboard/DashboardPostCard'
import { CommunityGroupMembersList } from './CommunityGroupMembersList'
import { CommunityGroupJoinRequestsCard } from './CommunityGroupJoinRequestsCard'
import {
  CommunityGroupAboutSettings,
  shouldShowGroupAboutSettings,
} from './CommunityGroupAboutSettings'

function getGroupMembersGridPreview(activeGroup, activeMembers, myId, isMemberOfActiveGroup) {
  const totalMembers = activeGroup?.memberCount ?? activeMembers.length ?? 0
  const membersExclSelf =
    myId != null && myId !== ''
      ? activeMembers.filter((m) => String(m.id) !== String(myId))
      : activeMembers
  const imInFetched =
    myId != null &&
    myId !== '' &&
    activeMembers.some((m) => String(m.id) === String(myId))
  const othersTotal =
    imInFetched || isMemberOfActiveGroup
      ? Math.max(0, totalMembers - 1)
      : totalMembers
  const maxSlots = 8
  const gridMembers = membersExclSelf.slice(0, maxSlots)
  const remainingExtras = othersTotal > maxSlots ? othersTotal - maxSlots : 0
  return { gridMembers, remainingExtras, totalMembers }
}

function GroupMembersPreviewCard({
  activeGroup,
  activeMembers,
  myId,
  isMemberOfActiveGroup,
  onOpenGroupMembersModal,
  navigate,
  t,
}) {
  const { gridMembers, remainingExtras, totalMembers } = getGroupMembersGridPreview(
    activeGroup,
    activeMembers,
    myId,
    isMemberOfActiveGroup
  )
  const membersWord = t('groups.header.members', { defaultValue: 'thành viên' })

  return (
    <div className="bg-white dark:bg-card-dark rounded-2xl p-6 space-y-4 border border-slate-200 dark:border-border-dark shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
          {t('groups.main.membersTitle', { defaultValue: 'Thành viên' })}{' '}
          <span className="text-slate-400 dark:text-gray-500 font-bold ml-1">
            · {totalMembers} {membersWord}
          </span>
        </h2>
      </div>

      <div className="h-px bg-slate-100 dark:bg-border-dark" />

      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {gridMembers.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => navigate(`/profile/${m.id}`)}
            className="flex flex-col items-center gap-2.5 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all text-center min-w-0 group"
          >
            <div className="size-14 sm:size-16 rounded-full border-2 border-white dark:border-slate-800 shadow-md overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img
                src={m.avatar || DEFAULT_AVATAR}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-100 line-clamp-1 w-full leading-tight">
              {m.name || t('groups.membersModal.unnamed', { defaultValue: 'Thành viên' })}
            </span>
          </button>
        ))}
      </div>

      {remainingExtras > 0 ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => onOpenGroupMembersModal?.()}
            className="inline-flex items-center gap-2 rounded-full pl-1.5 pr-5 py-1.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
            title={t('groups.header.viewAllMembers', { defaultValue: 'Xem tất cả thành viên' })}
          >
            <span className="size-9 rounded-full border-2 border-white dark:border-slate-900 bg-primary flex items-center justify-center text-xs font-black text-white shrink-0 shadow-lg shadow-primary/20">
              +{remainingExtras}
            </span>
            <span className="text-sm font-black text-slate-600 dark:text-slate-200">{membersWord}</span>
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onOpenGroupMembersModal?.()}
        className="w-full mt-2 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-black text-slate-600 dark:text-slate-100 text-center border border-slate-200 dark:border-slate-700/80 transition-all shadow-sm"
      >
        {t('groups.main.viewAllMembers', { defaultValue: 'Xem tất cả' })}
      </button>
    </div>
  )
}

export function CommunityMain({
  onOpenCreatePost,
  posts,
  postsLoading,
  postsHasMore,
  loadMorePosts,
  onPostReactionUpdate,
  onPostUpdate,
  onPostDelete,
  useHomeCommunityStyle = false,
  /** Trong trang nhóm: header card giống home, không lặp tên nhóm */
  hidePostGroupLabel = false,
  hideComposer = false,
  activeTab = 'posts',
  activeGroup = null,
  activeMembers = [],
  isMemberOfActiveGroup = false,
  onOpenGroupMembersModal,
  onMemberRemovedFromGroup,
  onJoinRequestApproved,
  joinRequestsRefreshKey = 0,
  myGroupMembership = null,
  onOpenInvite,
  onRefreshGroup,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const myId = user?.id ?? user?._id

  const displayAvatar =
    user?.avatar ||
    (user?.name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=13b6ec&color=fff`
      : 'https://ui-avatars.com/api/?name=User&background=13b6ec&color=fff')

  // About tab: show group intro instead of posts
  if (activeTab === 'about') {
    return (
      <div className="space-y-6">
        {/* Card: mô tả dài về nhóm */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 space-y-4 border border-slate-200 dark:border-border-dark shadow-sm">
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
            {t('groups.main.aboutTitle', { defaultValue: 'Giới thiệu về nhóm này' })}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-200 leading-relaxed font-medium">
            {activeGroup?.description || t('groups.sidebar.aboutEmpty')}
          </p>
        </div>

        {/* Card: Quyền riêng tư + Hiển thị */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-border-dark shadow-sm">
          <div className="space-y-4">
            <div>
              <p className="font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1.5 uppercase text-[11px] tracking-widest">
                <span className="material-symbols-outlined text-primary text-xl">public</span>
                {t('groups.sidebar.visibilityLabel', { defaultValue: 'Quyền riêng tư' })}
              </p>
              <p className="text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
                {activeGroup?.type === 'private'
                  ? t('groups.sidebar.privateDesc')
                  : activeGroup?.type === 'invite_only'
                    ? t('groups.sidebar.hiddenDesc')
                    : t('groups.sidebar.publicDesc')}
              </p>
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1.5 uppercase text-[11px] tracking-widest">
                <span className="material-symbols-outlined text-primary text-xl">search</span>
                {t('groups.sidebar.searchVisibility', { defaultValue: 'Hiển thị' })}
              </p>
              <p className="text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
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

          <div className="space-y-4">
            <div>
              <p className="font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1.5 uppercase text-[11px] tracking-widest">
                <span className="material-symbols-outlined text-primary text-xl">group</span>
                {t('groups.main.membersTitle', { defaultValue: 'Thành viên' })}
              </p>
              <p className="text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
                {(activeGroup?.memberCount ?? 0)}{' '}
                {t('groups.header.members', { defaultValue: 'thành viên' })}
              </p>
            </div>
            {activeGroup?.createdAt && (
              <div>
                <p className="font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1.5 uppercase text-[11px] tracking-widest">
                  <span className="material-symbols-outlined text-primary text-xl">history</span>
                  {t('groups.main.historyTitle', { defaultValue: 'Lịch sử' })}
                </p>
                <p className="text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
                  {t('groups.main.createdAt', {
                    defaultValue: 'Đã tạo nhóm vào {{date}}.',
                    date: new Date(activeGroup.createdAt).toLocaleDateString(),
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {shouldShowGroupAboutSettings({
          myGroupMembership,
          isMemberOfActiveGroup,
          onOpenInvite,
          onOpenGroupMembersModal,
        }) ? (
          <div className="lg:hidden bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-border-dark shadow-sm">
            <CommunityGroupAboutSettings
              noTopBorder
              activeGroup={activeGroup}
              myGroupMembership={myGroupMembership}
              isMemberOfActiveGroup={isMemberOfActiveGroup}
              onOpenInvite={onOpenInvite}
              onOpenGroupMembersModal={onOpenGroupMembersModal}
              onRefreshGroup={onRefreshGroup}
            />
          </div>
        ) : null}

        <GroupMembersPreviewCard
          activeGroup={activeGroup}
          activeMembers={activeMembers}
          myId={myId}
          isMemberOfActiveGroup={isMemberOfActiveGroup}
          onOpenGroupMembersModal={onOpenGroupMembersModal}
          navigate={navigate}
          t={t}
        />

        {/* Card: Hoạt động (mock đơn giản theo memberCount) */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-border-dark shadow-sm">
          <div className="space-y-1">
            <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-gray-500">
              {t('groups.main.activityToday', { defaultValue: 'Hoạt động gần đây' })}
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              ~{Math.max(1, Math.round((activeGroup?.memberCount || 0) * 0.02))}
            </p>
            <p className="font-bold text-slate-400 dark:text-gray-500 leading-tight">
              {t('groups.main.activityTodayHint', { defaultValue: 'bài viết / hôm nay' })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-gray-500">
              {t('groups.main.activityMonth', { defaultValue: 'Trong tháng này' })}
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              ~{Math.max(5, Math.round((activeGroup?.memberCount || 0) * 0.3))}
            </p>
            <p className="font-bold text-slate-400 dark:text-gray-500 leading-tight">
              {t('groups.main.activityMonthHint', { defaultValue: 'lượt tương tác' })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-gray-500">
              {t('groups.main.membersTotal', { defaultValue: 'Tổng thành viên' })}
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {activeGroup?.memberCount ?? 0}
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-gray-500">
              {t('groups.main.membersGrowth', { defaultValue: 'Ước tính tăng trưởng' })}
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              +{Math.max(1, Math.round((activeGroup?.memberCount || 0) * 0.05))}
            </p>
            <p className="font-bold text-slate-400 dark:text-gray-500 leading-tight">
              {t('groups.main.membersGrowthHint', { defaultValue: 'thành viên / tháng' })}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // People tab: full member list (same rows as modal), inline on page
  if (activeTab === 'people') {
    const gid = activeGroup?.id || activeGroup?._id || null
    return (
      <div className="space-y-6">
        <CommunityGroupJoinRequestsCard
          groupId={gid}
          enabled={!!gid}
          groupType={activeGroup?.type}
          onJoinRequestApproved={onJoinRequestApproved}
          refreshToken={joinRequestsRefreshKey}
        />
        <CommunityGroupMembersList
          groupId={gid}
          enabled={!!gid}
          variant="embedded"
          onMemberRemovedFromGroup={onMemberRemovedFromGroup}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!hideComposer && (
        <>
          {/* Create post */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-5 shadow-sm">
            <div className="flex gap-4">
              <div className="relative shrink-0">
                <img src={displayAvatar} alt="" className="size-10 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800" />
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white dark:border-card-dark" />
              </div>
              <button
                type="button"
                onClick={onOpenCreatePost}
                className="flex-1 text-left bg-slate-50 dark:bg-white/5 rounded-2xl px-5 py-3 text-sm text-slate-400 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all font-medium border border-slate-100 dark:border-transparent"
              >
                {t('groups.main.postPlaceholder', {
                  defaultValue: 'Viết gì đó cho nhóm này...',
                })}
              </button>
            </div>
            <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-border-dark">
              <div className="flex gap-1 w-full">
                <button
                  type="button"
                  onClick={onOpenCreatePost}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all group"
                >
                  <span className="material-symbols-outlined text-green-500 text-xl group-hover:scale-110 transition-transform">image</span>
                  <span className="text-xs font-black text-slate-600 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white">
                    {t('groups.main.actionMedia', { defaultValue: 'Photo/Video' })}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onOpenCreatePost}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all group"
                >
                  <span className="material-symbols-outlined text-sky-500 text-xl group-hover:scale-110 transition-transform">group_add</span>
                  <span className="text-xs font-black text-slate-600 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white">
                    {t('groups.main.actionTag', { defaultValue: 'Tag friends' })}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onOpenCreatePost}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all group"
                >
                  <span className="material-symbols-outlined text-yellow-500 text-xl group-hover:scale-110 transition-transform">mood</span>
                  <span className="text-xs font-black text-slate-600 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white">
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
        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-12 text-center shadow-sm">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary opacity-50">
            progress_activity
          </span>
          <p className="text-sm font-bold text-slate-500 dark:text-gray-400 mt-4">
            {t('dashboard.loading', { defaultValue: 'Đang tải...' })}
          </p>
        </div>
      ) : !posts || posts.length === 0 ? (
        <div className="bg-white dark:bg-card-dark border-2 border-dashed border-slate-200 dark:border-border-dark rounded-3xl p-16 text-center shadow-sm">
          <div className="size-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-gray-500">edit_note</span>
          </div>
          <p className="text-sm font-black text-slate-500 dark:text-gray-400 max-w-xs mx-auto">
            {t('dashboard.noPosts', {
              defaultValue: 'Chưa có bài viết trong nhóm này. Hãy viết bài đầu tiên phía trên!',
            })}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <DashboardPostCard
                key={post?.id ?? post?._id}
                post={post}
                useHomeCommunityStyle={useHomeCommunityStyle}
                hidePostGroupLabel={hidePostGroupLabel}
                onToggleLike={onPostReactionUpdate}
                onUpdatePost={onPostUpdate}
                onDeletePost={onPostDelete}
              />
            ))}
          </div>
          {postsHasMore && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={loadMorePosts}
                className="px-8 py-3 text-xs font-black text-slate-600 dark:text-slate-200 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl hover:bg-slate-50 dark:hover:bg-gray-700 transition-all shadow-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">expand_more</span>
                {t('dashboard.loadMore', { defaultValue: 'Tải thêm bài viết' })}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}


