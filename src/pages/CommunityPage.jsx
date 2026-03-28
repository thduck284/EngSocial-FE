import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useCommunityGroups } from '../hooks/useCommunityGroups'
import { CommunityInviteFriendsModal } from '../components/community/CommunityInviteFriendsModal'
import { CommunityGroupMembersModal } from '../components/community/CommunityGroupMembersModal'
import { CommunityLeftSidebar } from '../components/community/CommunityLeftSidebar'
import { CommunityHeader } from '../components/community/CommunityHeader'
import { CommunityMain } from '../components/community/CommunityMain'
import { CommunityRightSidebar } from '../components/community/CommunityRightSidebar'
import { CreatePostModal } from '../components/ui/post/CreatePostModal'
import { showEngSuccessToast } from '../utils/showEngToast'

export function CommunityPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { groupId, tab } = useParams()
  const {
    groups,
    loadingGroups,
    activeGroup,
    loadingActive,
    activeMembers,
    loadGroupDetail,
    posts,
    postsLoading,
    postsHasMore,
    loadMorePosts,
    handlePostReactionUpdate,
    handlePostUpdate,
    handlePostDelete,
    handlePostFromModal,
    feedPosts,
    feedLoading,
    feedHasMore,
    loadFeedPosts,
    loadMoreFeedPosts,
    leaveCommunityGroup,
    joinCommunityGroup,
    handleMemberRemovedFromGroup,
    handleJoinRequestApproved,
    myGroupMembership,
    acceptGroupInvite,
    declineGroupInvite,
    withdrawPendingJoinRequest,
  } = useCommunityGroups()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [joinRequestsRefreshKey, setJoinRequestsRefreshKey] = useState(0)
  const [createPostOpen, setCreatePostOpen] = useState(false)
  const [groupMembersModalOpen, setGroupMembersModalOpen] = useState(false)
  const lastLoadedGroupIdRef = useRef(null)
  const groupFeedHeaderRef = useRef(null)
  const normalizeTab = (raw) => {
    const v = (raw || '').toLowerCase()
    return ['about', 'posts', 'people', 'media', 'files'].includes(v) ? v : 'about'
  }

  const [groupTab, setGroupTab] = useState(normalizeTab(tab)) // 'about' | 'posts' | ...
  const handleLeaveGroup = useCallback(
    async (gid) => {
      await leaveCommunityGroup(gid)
      lastLoadedGroupIdRef.current = null
      navigate('/community/group-feed')
    },
    [leaveCommunityGroup, navigate]
  )

  const activeGid = activeGroup?.id ?? activeGroup?._id
  const membershipReady = !loadingGroups
  const isMemberOfActiveGroup = Boolean(
    membershipReady &&
      activeGid &&
      groups.some((g) => String(g.id ?? g._id) === String(activeGid))
  )

  const handleJoinGroup = useCallback(
    async (gid) => {
      await joinCommunityGroup(gid)
      showEngSuccessToast(t('groups.header.joinPendingNotice'))
    },
    [joinCommunityGroup, t]
  )
  const [viewMode, setViewMode] = useState(
    location.pathname.endsWith('/my-groups')
      ? 'list'
      : location.pathname.startsWith('/community/group/')
        ? 'group'
        : 'feed'
  ) // 'group' | 'list' | 'feed'

  // Sync URL -> selected group
  useEffect(() => {
    // My groups page: just show list
    if (location.pathname.endsWith('/my-groups')) {
      setViewMode('list')
      return
    }

    // Group detail page
    if (groupId) {
      const nextTab = normalizeTab(tab)
      setGroupTab(nextTab)
      if (lastLoadedGroupIdRef.current !== groupId) {
        lastLoadedGroupIdRef.current = groupId
        setViewMode('group')
        loadGroupDetail(groupId)
      }
      return
    }

    // Group feed tab: /community/group-feed
    if (location.pathname.endsWith('/community/group-feed')) {
      setViewMode('feed')
      if (!feedLoading && feedPosts.length === 0) {
        loadFeedPosts(1)
      }
      return
    }
  }, [location.pathname, groupId, tab, feedLoading, feedPosts.length, loadFeedPosts])

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <CommunityLeftSidebar
          groups={groups}
          loadingGroups={loadingGroups}
          activeGroup={activeGroup}
          onSelectGroup={(id) => {
            setViewMode('group')
            navigate(`/community/group/${id}/about`)
          }}
          onShowYourGroups={() => {
            setViewMode('list')
            if (!location.pathname.endsWith('/my-groups')) {
              navigate('/community/my-groups')
            }
          }}
          onViewAllJoined={() => {
            setViewMode('list')
            if (!location.pathname.endsWith('/my-groups')) {
              navigate('/community/my-groups')
            }
          }}
        />

        {viewMode === 'group' ? (
          <>
            <div className="md:col-span-9 lg:col-span-6 space-y-6">
              <CommunityHeader
                activeGroup={activeGroup}
                activeMembers={activeMembers}
                loadingActive={loadingActive}
                loadingMembership={loadingGroups}
                isMemberOfActiveGroup={isMemberOfActiveGroup}
                myGroupMembership={myGroupMembership}
                onAcceptGroupInvite={acceptGroupInvite}
                onDeclineGroupInvite={declineGroupInvite}
                onWithdrawPendingJoinRequest={withdrawPendingJoinRequest}
                onOpenInvite={() => setInviteOpen(true)}
                onOpenGroupMembersModal={() => setGroupMembersModalOpen(true)}
                onLeaveGroup={handleLeaveGroup}
                onJoinGroup={handleJoinGroup}
                activeTab={groupTab}
                onTabChange={(next) => {
                  const normalized = normalizeTab(next)
                  setGroupTab(normalized)
                  const id = activeGroup?.id || activeGroup?._id || groupId
                  if (id) {
                    navigate(`/community/group/${id}/${normalized}`)
                  }
                }}
              />
              <CommunityMain
                onOpenCreatePost={() => setCreatePostOpen(true)}
                posts={posts}
                postsLoading={postsLoading}
                postsHasMore={postsHasMore}
                loadMorePosts={loadMorePosts}
                onPostReactionUpdate={handlePostReactionUpdate}
                onPostUpdate={handlePostUpdate}
                onPostDelete={handlePostDelete}
                activeTab={groupTab}
                activeGroup={activeGroup}
                activeMembers={activeMembers}
                isMemberOfActiveGroup={isMemberOfActiveGroup}
                onOpenGroupMembersModal={() => setGroupMembersModalOpen(true)}
                onMemberRemovedFromGroup={handleMemberRemovedFromGroup}
                onJoinRequestApproved={handleJoinRequestApproved}
                joinRequestsRefreshKey={joinRequestsRefreshKey}
                hidePostGroupLabel
                myGroupMembership={myGroupMembership}
                onOpenInvite={() => setInviteOpen(true)}
                onRefreshGroup={async () => {
                  const id = activeGroup?.id || activeGroup?._id || groupId
                  if (id) await loadGroupDetail(id)
                }}
              />
            </div>

            <CommunityRightSidebar
              activeGroup={activeGroup}
              myGroupMembership={myGroupMembership}
              isMemberOfActiveGroup={isMemberOfActiveGroup}
              onOpenInvite={() => setInviteOpen(true)}
              onOpenGroupMembersModal={() => setGroupMembersModalOpen(true)}
              onRefreshGroup={async () => {
                const id = activeGroup?.id || activeGroup?._id || groupId
                if (id) await loadGroupDetail(id)
              }}
            />
          </>
        ) : viewMode === 'list' ? (
          <div className="md:col-span-9 lg:col-span-9 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">
                  {t('groups.sidebar.joinedTitle')}
                </h2>
                <p className="text-xs text-slate-400">
                  {t('groups.sidebar.viewAllSubtitle', {
                    defaultValue: 'Tất cả các nhóm bạn đã tham gia',
                  })}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((g) => {
                const id = g.id || g._id
                return (
                  <button
                    key={id || g.slug}
                    type="button"
                    onClick={() => {
                      setViewMode('group')
                      navigate(`/community/group/${id}/about`)
                    }}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-left hover:border-primary/60 hover:bg-slate-900 transition-colors flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white overflow-hidden">
                        {g.icon ? (
                          <img src={g.icon} alt={g.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined">group</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{g.name}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {g.memberCount ?? 0} {t('groups.header.members', { defaultValue: 'thành viên' })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {g.description}
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-[11px] text-slate-200">
                        {t('groups.sidebar.openGroup', { defaultValue: 'Xem nhóm' })}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          // Feed: all groups' posts (Your group feed)
          <div className="md:col-span-9 lg:col-span-6 space-y-6">
            <header
              ref={groupFeedHeaderRef}
              tabIndex={-1}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 md:p-6 outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f12]"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/30">
                  <span className="material-symbols-outlined text-2xl text-primary" aria-hidden>
                    dynamic_feed
                  </span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg md:text-xl font-bold text-slate-100 tracking-tight">
                    {t('groups.sidebar.myFeed')}
                  </h1>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {t('groups.sidebar.feedSubtitle', {
                      defaultValue: 'Posts from all groups you have joined',
                    })}
                  </p>
                </div>
              </div>
            </header>
            <CommunityMain
              onOpenCreatePost={() => setCreatePostOpen(true)}
              posts={feedPosts}
              postsLoading={feedLoading}
              postsHasMore={feedHasMore}
              loadMorePosts={loadMoreFeedPosts}
              onPostReactionUpdate={handlePostReactionUpdate}
              onPostUpdate={handlePostUpdate}
              onPostDelete={handlePostDelete}
              useHomeCommunityStyle
              hideComposer
            />
          </div>
        )}
      </div>

      <CommunityGroupMembersModal
        open={groupMembersModalOpen && viewMode === 'group'}
        onClose={() => setGroupMembersModalOpen(false)}
        groupId={viewMode === 'group' ? activeGid || null : null}
        onMemberRemovedFromGroup={handleMemberRemovedFromGroup}
      />
      <CommunityInviteFriendsModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        groupId={activeGroup?.id || activeGroup?._id || null}
        onInviteSent={() => setJoinRequestsRefreshKey((k) => k + 1)}
      />
      <CreatePostModal
        open={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        onSuccess={(newPost) => {
          handlePostFromModal(newPost)
          setCreatePostOpen(false)
        }}
        groupId={activeGroup?.id || activeGroup?._id || null}
        initialVisibility="public"
        forGroup
      />
    </main>
  )
}

