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
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">
          {t('groups.main.membersTitle', { defaultValue: 'Thành viên' })}{' '}
          <span className="text-slate-400">
            · {totalMembers} {membersWord}
          </span>
        </h2>
      </div>

      <div className="h-px bg-slate-800" />

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {gridMembers.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => navigate(`/profile/${m.id}`)}
            className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-slate-700 transition-colors text-center min-w-0"
          >
            <div className="size-14 sm:size-16 rounded-full border-2 border-slate-800 bg-slate-700 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={m.avatar || DEFAULT_AVATAR}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-slate-100 line-clamp-2 w-full leading-tight">
              {m.name || t('groups.membersModal.unnamed', { defaultValue: 'Thành viên' })}
            </span>
          </button>
        ))}
      </div>

      {remainingExtras > 0 ? (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => onOpenGroupMembersModal?.()}
            className="inline-flex items-center gap-2 rounded-full pl-1 pr-4 py-1 bg-slate-800/90 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-colors"
            title={t('groups.header.viewAllMembers', { defaultValue: 'Xem tất cả thành viên' })}
          >
            <span className="size-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-100 shrink-0">
              +{remainingExtras}
            </span>
            <span className="text-sm font-medium text-slate-200">{membersWord}</span>
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onOpenGroupMembersModal?.()}
        className="w-full mt-1 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-sm font-semibold text-slate-100 text-center border border-slate-700/80"
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

        {shouldShowGroupAboutSettings({
          myGroupMembership,
          isMemberOfActiveGroup,
          onOpenInvite,
          onOpenGroupMembersModal,
        }) ? (
          <div className="lg:hidden bg-slate-900/80 border border-slate-800 rounded-xl p-6">
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

  // People tab: full member list (same rows as modal), inline on page
  if (activeTab === 'people') {
    const gid = activeGroup?.id || activeGroup?._id || null
    return (
      <section className="md:col-span-9 lg:col-span-6 space-y-6">
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
              useHomeCommunityStyle={useHomeCommunityStyle}
              hidePostGroupLabel={hidePostGroupLabel}
              onToggleLike={onPostReactionUpdate}
              onUpdatePost={onPostUpdate}
              onDeletePost={onPostDelete}
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

