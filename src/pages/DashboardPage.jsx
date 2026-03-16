import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { DEFAULT_AVATAR } from '../constants/ui'
import { useDashboardData } from '../hooks/useDashboardData'
import { useDashboardFriends } from '../hooks/useDashboardFriends'
import { useDashboardSocket } from '../hooks/useDashboardSocket'
import { useStudyGroups } from '../hooks/useStudyGroups'
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
    weeklyLeaderboard,
    weeklyLeaderboardLoading,
  } = useDashboardData()

  const studyGroups = useStudyGroups()
  const { onlineUserIds } = useDashboardSocket(user, studyGroups.setGroupConversations)
  const friends = useDashboardFriends(onlineUserIds)

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
      <DashboardLeftSidebar
        displayAvatar={displayAvatar}
        displayName={displayName}
        profileProgress={profileProgress}
        weeklyStatsOpen={weeklyStatsOpen}
        setWeeklyStatsOpen={setWeeklyStatsOpen}
        raw={raw}
        studyGroups={studyGroups}
      />
      <DashboardMainFeed
        displayAvatar={displayAvatar}
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        handlePostFromModal={handlePostFromModal}
        onPostReactionUpdate={updatePostReaction}
        studyGroups={studyGroups}
        suggestedGroups={raw.suggestedGroups}
        postsLoading={postsLoading}
        posts={posts}
        postsLoadingMore={postsLoadingMore}
        hasMorePosts={hasMorePosts}
        loadMorePosts={loadMorePosts}
        friendsList={displayedFriendsList}
      />
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
        weeklyLeaderboard={weeklyLeaderboard}
        weeklyLeaderboardLoading={weeklyLeaderboardLoading}
      />
    </main>
  )
}
