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
    feedSort,
    discoverGroups,
    loadingDiscover,
    loadDiscoverGroups,
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
  const [visibleGroupsLimit, setVisibleGroupsLimit] = useState(6)
  const [visibleDiscoverLimit, setVisibleDiscoverLimit] = useState(6)
  const [visibleJoinedDiscoverLimit, setVisibleJoinedDiscoverLimit] = useState(6)
  const lastLoadedGroupIdRef = useRef(null)
  const groupFeedHeaderRef = useRef(null)
  const feedInitialLoadRef = useRef(false)
  const discoverInitialLoadRef = useRef(false)
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
      if (!feedInitialLoadRef.current) {
        feedInitialLoadRef.current = true
        loadFeedPosts(1)
      }
      return
    }

    // Discover page: /community/discover
    if (location.pathname.endsWith('/community/discover')) {
      setViewMode('discover')
      if (!discoverInitialLoadRef.current) {
        discoverInitialLoadRef.current = true
        loadDiscoverGroups()
      }
      return
    }
  }, [location.pathname, groupId, tab, loadGroupDetail, loadFeedPosts, loadDiscoverGroups])

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
        ) : viewMode === 'list' || viewMode === 'discover' ? (
          <div className="md:col-span-9 lg:col-span-9 space-y-8">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/30">
                  <span className="material-symbols-outlined text-2xl text-primary" aria-hidden>
                    {viewMode === 'discover' ? 'explore' : 'groups'}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-100 tracking-tight">
                    {viewMode === 'discover'
                      ? t('groups.sidebar.discover')
                      : t('groups.sidebar.joinedTitle')}
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {viewMode === 'discover'
                      ? t('groups.sidebar.discoverSubtitle', {
                          defaultValue: 'Khám phá cộng đồng mới dựa trên sở thích và bạn bè',
                        })
                      : t('groups.sidebar.viewAllSubtitle', {
                          defaultValue: 'Tất cả các nhóm bạn đã tham gia',
                        })}
                  </p>
                </div>
              </div>
            </div>

            {(() => {
              const items = viewMode === 'discover' ? discoverGroups : groups
              const unjoined = viewMode === 'discover' 
                ? items.filter(g => !groups.some(myG => String(myG.id ?? myG._id) === String(g.id ?? g._id)))
                : items
              const joined = viewMode === 'discover'
                ? items.filter(g => groups.some(myG => String(myG.id ?? myG._id) === String(g.id ?? g._id)))
                : []

              const renderSection = (list, title, isJoinedSection = false) => {
                if (list.length === 0) return null
                
                // Phân trang phía client: 6 nhóm 1 lần
                const limit = isJoinedSection 
                  ? visibleJoinedDiscoverLimit 
                  : (viewMode === 'discover' ? visibleDiscoverLimit : visibleGroupsLimit)
                
                const setLimit = isJoinedSection
                  ? setVisibleJoinedDiscoverLimit
                  : (viewMode === 'discover' ? setVisibleDiscoverLimit : setVisibleGroupsLimit)

                const visibleList = list.slice(0, limit)
                const hasMore = list.length > limit

                return (
                  <div className="space-y-4">
                    {title && (
                      <div className="flex items-center gap-2 px-1">
                        <div className="h-4 w-1 bg-primary rounded-full" />
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                          {title}
                        </h3>
                        <span className="text-xs text-slate-600">({list.length})</span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {visibleList.map((g) => {
                        const id = g.id || g._id
                        const isActuallyJoined = isJoinedSection || groups.some((myG) => String(myG.id ?? myG._id) === String(id))
                        return (
                          <div
                            key={id || g.slug}
                            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-primary/40 hover:bg-slate-900/40 transition-all flex flex-col gap-4 relative group"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setViewMode('group')
                                navigate(`/community/group/${id}/about`)
                              }}
                              className="absolute inset-0 z-0"
                            />
                            <div className="flex items-center gap-4 relative z-10 pointer-events-none">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center border border-slate-700 overflow-hidden transform group-hover:scale-105 transition-transform">
                                {g.icon ? (
                                  <img src={g.icon} alt={g.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-3xl text-primary/80">
                                    group
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-100 truncate group-hover:text-primary transition-colors">
                                  {g.name}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-sm">groups</span>
                                  {g.memberCount ?? 0}{' '}
                                  {t('groups.header.members', { defaultValue: 'thành viên' })}
                                </p>
                              </div>
                            </div>
                            <div className="text-sm text-slate-400 line-clamp-2 min-h-[40px] leading-relaxed relative z-10 pointer-events-none">
                              {g.description || t('groups.sidebar.aboutEmpty')}
                            </div>
                            <div className="mt-auto pt-2 relative z-10 flex gap-2">
                              {isActuallyJoined ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setViewMode('group')
                                    navigate(`/community/group/${id}/about`)
                                  }}
                                  className="flex-1 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all"
                                >
                                  {t('groups.sidebar.openGroup', { defaultValue: 'Xem nhóm' })}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleJoinGroup(id)}
                                  className="flex-1 py-2 rounded-xl bg-primary text-[#111e22] text-xs font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                                >
                                  {t('groups.header.join', { defaultValue: 'Tham gia' })}
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {hasMore && (
                      <div className="flex justify-center pt-4">
                        <button
                          type="button"
                          onClick={() => setLimit(prev => prev + 6)}
                          className="px-8 py-2.5 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-300 text-sm font-bold hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2"
                        >
                          {t('common.loadMore') || 'Xem thêm'}
                          <span className="material-symbols-outlined text-lg">expand_more</span>
                        </button>
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <div className="space-y-10">
                  {viewMode === 'discover' ? (
                    <>
                      {renderSection(unjoined, t('groups.sidebar.suggestedForYou', { defaultValue: 'Gợi ý cho bạn' }))}
                      {renderSection(joined, t('groups.sidebar.joinedCommunities', { defaultValue: 'Cộng đồng đã tham gia' }), true)}
                    </>
                  ) : (
                    renderSection(groups, null)
                  )}

                  {items.length === 0 && (
                    <div className="py-20 text-center bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl">
                      <span className="material-symbols-outlined text-5xl text-slate-700 mb-3">
                        {viewMode === 'discover' ? 'explore_off' : 'group_off'}
                      </span>
                      <p className="text-slate-500 font-medium">
                        {viewMode === 'discover'
                          ? t('groups.sidebar.noDiscover', {
                              defaultValue: 'Không tìm thấy nhóm gợi ý nào mới.',
                            })
                          : t('groups.sidebar.emptyGroups', {
                              defaultValue: 'Bạn chưa tham gia nhóm nào.',
                            })}
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        ) : (
          // Feed: all groups' posts (Your group feed)
          <div className="md:col-span-9 lg:col-span-6 space-y-6">
            <header
              ref={groupFeedHeaderRef}
              tabIndex={-1}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 md:p-6 outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f12]"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                        defaultValue: 'Bài viết từ tất cả các nhóm bạn tham gia',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
                  <button
                    onClick={() => loadFeedPosts(1, 'latest')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                      feedSort === 'latest'
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t('dashboard.all') || 'Mới nhất'}
                  </button>
                  <button
                    onClick={() => loadFeedPosts(1, 'popular')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                      feedSort === 'popular'
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t('dashboard.popular') || 'Phổ biến'}
                  </button>
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

