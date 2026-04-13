import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { DEFAULT_AVATAR } from '../constants/ui'
import { useDashboardData, useDashboardFriends, useDashboardSocket, useStudyGroups } from '../hooks'
import { DashboardLeftSidebar } from '../components/dashboard/DashboardLeftSidebar'
import { DashboardMainFeed } from '../components/dashboard/DashboardMainFeed'
import { DashboardRightSidebar } from '../components/dashboard/DashboardRightSidebar'

export function DashboardPage() {
  const { user } = useAuth()
  const [weeklyStatsOpen, setWeeklyStatsOpen] = useState(true)

  const {
    raw,
    posts,
    postsLoading,
    postsLoadingMore,
    hasMorePosts,
    loadMorePosts,
    showCreateModal,
    setShowCreateModal,
    profileProgress,
    handlePostFromModal,
    updatePostReaction,
    updatePostInFeed,
    removePostFromFeed,
    weeklyLeaderboard,
    weeklyLeaderboardLoading,
    feedTab,
    setFeedTab,
  } = useDashboardData()

  const [onlineUserIds, setOnlineUserIds] = useState(new Set())
  const studyGroups = useStudyGroups(setOnlineUserIds)
  const friends = useDashboardFriends(onlineUserIds, setOnlineUserIds, studyGroups.allConversations)
  useDashboardSocket(user, studyGroups.setConversations, friends.setOnlineFriends, setOnlineUserIds)

  const {
    friendsFilterTab,
    setFriendsFilterTab,
    friendTab,
    setFriendTab,
    suggestionsList,
    sentRequestsList,
    receivedRequestsList,
    friendTabLoading,
    loadFriendTabData,
    displayedFriendsList,
    friendSelectOpen,
    setFriendSelectOpen,
    friendSelectRef,
  } = friends

  const displayAvatar = user?.avatar || (user?.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=13b6ec&color=fff` : DEFAULT_AVATAR)
  const displayName = user?.name || 'User'

  return (
    <main className="max-w-[1440px] mx-auto grid grid-cols-12 gap-6 p-6">
      <div className="hidden lg:block lg:col-span-3 pr-2 lg:sticky lg:top-4 self-start max-h-[calc(100vh-64px)] overflow-y-auto space-y-6">
        <DashboardLeftSidebar
          displayAvatar={displayAvatar}
          displayName={displayName}
          profileProgress={profileProgress}
          weeklyStatsOpen={weeklyStatsOpen}
          setWeeklyStatsOpen={setWeeklyStatsOpen}
          raw={raw}
          studyGroups={studyGroups}
        />
      </div>
      <div className="col-span-12 lg:col-span-6">
        <DashboardMainFeed
          displayAvatar={displayAvatar}
          showCreateModal={showCreateModal}
          setShowCreateModal={setShowCreateModal}
          handlePostFromModal={handlePostFromModal}
          onPostReactionUpdate={updatePostReaction}
          onPostUpdate={updatePostInFeed}
          onPostDelete={removePostFromFeed}
          studyGroups={studyGroups}
          suggestedGroups={raw.suggestedGroups}
          postsLoading={postsLoading}
          posts={posts}
          postsLoadingMore={postsLoadingMore}
          hasMorePosts={hasMorePosts}
          loadMorePosts={loadMorePosts}
          feedTab={feedTab}
          setFeedTab={setFeedTab}
          friendsList={displayedFriendsList}
        />
      </div>
      <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-4 self-start max-h-[calc(100vh-64px)] overflow-y-auto space-y-6">
        <DashboardRightSidebar
          friendSelectRef={friendSelectRef}
          friendSelectOpen={friendSelectOpen}
          setFriendSelectOpen={setFriendSelectOpen}
          friendTab={friendTab}
          setFriendTab={setFriendTab}
          friendTabLoading={friendTabLoading}
          suggestionsList={suggestionsList}
          sentRequestsList={sentRequestsList}
          receivedRequestsList={receivedRequestsList}
          loadFriendTabData={loadFriendTabData}
          friendsFilterTab={friendsFilterTab}
          setFriendsFilterTab={setFriendsFilterTab}
          displayedFriendsList={displayedFriendsList}
          onlineUserIds={onlineUserIds}
          groupConversations={studyGroups.groupConversations}
          weeklyLeaderboard={weeklyLeaderboard}
          weeklyLeaderboardLoading={weeklyLeaderboardLoading}
        />
      </div>
    </main>
  )
}
