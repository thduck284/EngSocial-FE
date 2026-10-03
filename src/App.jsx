import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PostFeedSyncProvider } from './context/PostFeedSyncContext'
import { Toaster } from 'react-hot-toast'
import { ROUTES } from './constants'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { TermPage } from './pages/TermPage'
import { DashboardPage } from './pages/DashboardPage'
import { PostPhotoPage } from './pages/PostPhotoPage'
import { PostDetailPage } from './pages/PostDetailPage'
import { EntertainmentLayout } from './pages/EntertainmentLayout'
import { EntertainmentHomePage } from './pages/EntertainmentHomePage'
import { EntertainmentWordScramblePage } from './pages/EntertainmentWordScramblePage'
import { EntertainmentSnakeWordPage } from './pages/EntertainmentSnakeWordPage'
import WordScrambleResultPage from './pages/WordScrambleResultPage'
import { SkillPracticePage } from './pages/SkillPracticePage'
import { ListeningLessonPage } from './pages/ListeningLessonPage'
import { ReadingLessonPage } from './pages/ReadingLessonPage'
import { ReadingLessonResultPage } from './pages/ReadingLessonResultPage'
import { ListeningLessonResultPage } from './pages/ListeningLessonResultPage'
import { WritingLessonResultPage } from './pages/WritingLessonResultPage'
import { WritingLessonPage } from './pages/WritingLessonPage'
import { PracticeMockTestPage } from './pages/PracticeMockTestPage'
import { MockTestResultPage } from './pages/MockTestResultPage'
import { ProfilePage } from './pages/ProfilePage'
import { UserProfilePage } from './pages/UserProfilePage'
import { LessonsPage } from './pages/LessonsPage'
import { LessonDetailPage } from './pages/LessonDetailPage'
import { LessonHistoryPage } from './pages/LessonHistoryPage'
import { LessonReviewPage } from './pages/LessonReviewPage'
import { QuestsPage } from './pages/QuestsPage'
import { AchievementsPage } from './pages/AchievementsPage'
import { ManageLessonsPage } from './pages/ManageLessonsPage'
import { ManageLessonsListPage } from './pages/ManageLessonsListPage'
import { ManageQuestsPage } from './pages/ManageQuestsPage'
import { ManageQuestsListPage } from './pages/ManageQuestsListPage'
import { ManageChallengesPage } from './pages/ManageChallengesPage'
import { ManageChallengesListPage } from './pages/ManageChallengesListPage'
import { ManageWordScramblePage } from './pages/ManageWordScramblePage'
import { StaffManageHomePage } from './pages/StaffManageHomePage'
import { StaffEntertainmentHomePage } from './pages/StaffEntertainmentHomePage'
import { SearchPage } from './pages/SearchPage'
import { MessagesPage } from './pages/MessagesPage'
import { CommunityPage } from './pages/CommunityPage'
import { GroupCreatePage } from './pages/GroupCreatePage'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { StaffPortalLayout } from './components/layout/StaffPortalLayout'
import { RequireAdmin } from './components/layout/RequireAdmin'
import { RequireModeratorStaffRoutes } from './components/layout/RequireModeratorStaffRoutes'
import { AdminOverviewPage } from './pages/AdminOverviewPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { AdminReportsPage } from './pages/AdminReportsPage'
import { GuestOnlyLayout } from './components/layout/GuestOnlyLayout'
import { GuestRestrictedPage } from './components/auth/GuestRestrictedPage'
import { GuestDetailGuard } from './components/auth/GuestDetailGuard'
import { WordsNotesLayout } from './components/vocabulary/WordsNotesLayout'
import VocabularyTopicsTab from './pages/VocabularyTopicsTab'
import VocabularyNotesPanel from './components/vocabulary/VocabularyNotesPanel'
import VocabularyMyWordsPanel from './components/vocabulary/VocabularyMyWordsPanel'
import TopicDetailPage from './pages/TopicDetailPage'
import FlashCardPage from './pages/FlashCardPage'
import VocabularyDataPage from './pages/VocabularyDataPage'
import LearnPage from './pages/LearnPage'
import MatchGamePage from './pages/MatchGamePage'
import TestPage from './pages/TestPage'
import { SettingsPage } from './pages/SettingsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { HelpPage } from './pages/HelpPage'
import { GlobalGameInviteListener } from './components/GlobalGameInviteListener'
import { GlobalAuthSessionListener } from './components/GlobalAuthSessionListener'
import { AchievementUnlockedToast } from './components/achievements/AchievementUnlockedToast'

/** /manage/* → /mod/:userId/* */
function LegacyManageRedirect() {
  const { user, isAuthenticated, isModerator, isAdmin } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  if (!isModerator && !isAdmin) return <Navigate to={ROUTES.HOME} replace />
  const suffix = location.pathname === '/manage' ? '' : location.pathname.slice('/manage'.length)
  if (suffix === '' || suffix === '/') {
    if (isAdmin) return <Navigate to={ROUTES.MANAGE_ADMIN_OVERVIEW(user.id)} replace />
    return <Navigate to={ROUTES.MANAGE_OVERVIEW(user.id)} replace />
  }
  return <Navigate to={`${ROUTES.MANAGE_ROOT(user.id)}${suffix.startsWith('/') ? suffix : `/${suffix}`}`} replace />
}

/** /mod/:userId — admin sang /adminstrator/.../overview; moderator vào Tổng quan */
function ModPortalIndexRedirect() {
  const { isAdmin, user } = useAuth()
  if (!user?.id) return <Navigate to={ROUTES.HOME} replace />
  if (isAdmin) return <Navigate to={ROUTES.MANAGE_ADMIN_OVERVIEW(user.id)} replace />
  return <Navigate to="over-view" replace />
}

/** URL cũ /mod/:id/admin/users|reports → /adminstrator/:id/users|reports */
function LegacyModAdminUsersRedirect() {
  const { userId } = useParams()
  return <Navigate to={ROUTES.MANAGE_ADMIN_USERS(userId)} replace />
}
function LegacyModAdminReportsRedirect() {
  const { userId } = useParams()
  return <Navigate to={ROUTES.MANAGE_ADMIN_REPORTS(userId)} replace />
}

/** /skills/:skill → /practice/:skill */
function SkillRedirect() {
  const { skill } = useParams()
  return <Navigate to={`/practice/${skill}`} replace />
}

function App() {
  const location = useLocation()
  const background = location.state?.background

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <AuthProvider>
      <PostFeedSyncProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <GlobalGameInviteListener />
      <GlobalAuthSessionListener />
      <AchievementUnlockedToast />
      <Routes location={background || location}>
        {/* Auth - chỉ khi chưa đăng nhập; đã đăng nhập thì redirect về / */}
        <Route element={<GuestOnlyLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>
        <Route path="/term" element={<TermPage />} />
        <Route path="/help" element={<HelpPage />} />

        {/* Các route cần đăng nhập: DashboardLayout dùng useAuth() để redirect */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<GuestRestrictedPage><DashboardPage /></GuestRestrictedPage>} />
          <Route path="post/photo/:postId" element={<GuestRestrictedPage><PostPhotoPage /></GuestRestrictedPage>} />
          <Route path="post/:postId" element={<GuestRestrictedPage><PostDetailPage /></GuestRestrictedPage>} />
          <Route path="search" element={<GuestRestrictedPage><SearchPage /></GuestRestrictedPage>} />
          <Route path="messages/conversation/:conversationId" element={<GuestRestrictedPage><MessagesPage /></GuestRestrictedPage>} />
          <Route path="messages" element={<GuestRestrictedPage><MessagesPage /></GuestRestrictedPage>} />

          <Route path="community" element={<Navigate to="/community/group-feed" replace />} />
          <Route path="community/group-feed" element={<GuestRestrictedPage><CommunityPage /></GuestRestrictedPage>} />
          <Route path="community/group/:groupId" element={<GuestRestrictedPage><CommunityPage /></GuestRestrictedPage>} />
          <Route path="community/group/:groupId/:tab" element={<GuestRestrictedPage><CommunityPage /></GuestRestrictedPage>} />
          <Route path="community/my-groups" element={<GuestRestrictedPage><CommunityPage /></GuestRestrictedPage>} />
          <Route path="community/discover" element={<GuestRestrictedPage><CommunityPage /></GuestRestrictedPage>} />
          <Route path="community/create" element={<GuestRestrictedPage><GroupCreatePage /></GuestRestrictedPage>} />

          <Route path="enter" element={<Navigate to="/practice/entertainment" replace />} />
          <Route path="practice/entertainment" element={<EntertainmentLayout />}>
            <Route index element={<EntertainmentHomePage />} />
          </Route>
          <Route path="practice/entertainment/word-scramble" element={<GuestDetailGuard fallback="/practice/entertainment"><EntertainmentWordScramblePage /></GuestDetailGuard>} />
          <Route path="practice/entertainment/word-scramble/lobby/:lobbyCode" element={<GuestDetailGuard fallback="/practice/entertainment"><EntertainmentWordScramblePage /></GuestDetailGuard>} />
          <Route path="practice/entertainment/word-scramble/roomId=:roomCode" element={<GuestDetailGuard fallback="/practice/entertainment"><EntertainmentWordScramblePage /></GuestDetailGuard>} />
          <Route path="practice/entertainment/word-scramble/result/:roomCode" element={<GuestDetailGuard fallback="/practice/entertainment"><WordScrambleResultPage /></GuestDetailGuard>} />
          <Route path="practice/entertainment/snake-word" element={<GuestDetailGuard fallback="/practice/entertainment"><EntertainmentSnakeWordPage /></GuestDetailGuard>} />
          <Route path="practice/entertainment/snake-word/lobby/:lobbyCode" element={<GuestDetailGuard fallback="/practice/entertainment"><EntertainmentSnakeWordPage /></GuestDetailGuard>} />
          <Route path="practice/entertainment/snake-word/roomId=:roomCode" element={<GuestDetailGuard fallback="/practice/entertainment"><EntertainmentSnakeWordPage /></GuestDetailGuard>} />
          <Route path="practice/entertainment/snake-word/result/:roomCode" element={<GuestDetailGuard fallback="/practice/entertainment"><WordScrambleResultPage /></GuestDetailGuard>} />
          <Route path="lesson" element={<LessonsPage />} />
          <Route path="lesson/history" element={<GuestDetailGuard fallback="/lesson"><LessonHistoryPage /></GuestDetailGuard>} />
          <Route path="lesson/:id/reviews" element={<GuestDetailGuard fallback="/lesson"><LessonReviewPage /></GuestDetailGuard>} />
          
          {/* Detail pages */}
          <Route path="lesson/:skill/:id" element={<GuestDetailGuard><LessonDetailPage /></GuestDetailGuard>} />
          <Route path="practice/:skill/:id" element={<GuestDetailGuard><LessonDetailPage /></GuestDetailGuard>} />

          {/* Learning study pages */}
          <Route path="lesson/reading/:id/study" element={<GuestDetailGuard><ReadingLessonPage /></GuestDetailGuard>} />
          <Route path="lesson/reading/:id/result" element={<GuestDetailGuard><ReadingLessonResultPage /></GuestDetailGuard>} />
          <Route path="lesson/listening/:id/study" element={<GuestDetailGuard><ListeningLessonPage /></GuestDetailGuard>} />
          <Route path="lesson/listening/:id/result" element={<GuestDetailGuard><ListeningLessonResultPage /></GuestDetailGuard>} />
          <Route path="lesson/writing/:id/study" element={<GuestDetailGuard><WritingLessonPage /></GuestDetailGuard>} />
          <Route path="lesson/writing/:id/result" element={<GuestDetailGuard><WritingLessonResultPage /></GuestDetailGuard>} />

          <Route path="practice" element={<Navigate to="/practice/reading" replace />} />
          <Route path="practice/mock-test" element={<GuestDetailGuard fallback="/practice/reading"><PracticeMockTestPage /></GuestDetailGuard>} />
          <Route path="practice/mock-test/result/:sessionId" element={<GuestDetailGuard fallback="/practice/reading"><MockTestResultPage /></GuestDetailGuard>} />
          <Route path="practice/:skill" element={<SkillPracticePage />} />
          
          <Route path="practice/reading/:id/study" element={<GuestDetailGuard><ReadingLessonPage /></GuestDetailGuard>} />
          <Route path="practice/reading/:id/result" element={<GuestDetailGuard><ReadingLessonResultPage /></GuestDetailGuard>} />
          <Route path="practice/listening/:id/study" element={<GuestDetailGuard><ListeningLessonPage /></GuestDetailGuard>} />
          <Route path="practice/listening/:id/result" element={<GuestDetailGuard><ListeningLessonResultPage /></GuestDetailGuard>} />
          <Route path="practice/writing/:id/study" element={<GuestDetailGuard><WritingLessonPage /></GuestDetailGuard>} />
          <Route path="practice/writing/:id/result" element={<GuestDetailGuard><WritingLessonResultPage /></GuestDetailGuard>} />
          <Route path="skills" element={<Navigate to="/practice" replace />} />
          <Route path="skills/:skill" element={<SkillRedirect />} />
          <Route path="lessons" element={<Navigate to="/lesson" replace />} />

          <Route path="quests" element={<GuestRestrictedPage><QuestsPage /></GuestRestrictedPage>} />
          <Route path="challenge" element={<GuestRestrictedPage><QuestsPage /></GuestRestrictedPage>} />
          <Route path="achievements" element={<GuestRestrictedPage><AchievementsPage /></GuestRestrictedPage>} />

          {/* Profile routes: own profile + user profile, each tab có URL riêng */}
          <Route path="profile" element={<GuestRestrictedPage><ProfilePage /></GuestRestrictedPage>} />
          <Route path="profile/personalInfo" element={<GuestRestrictedPage><ProfilePage /></GuestRestrictedPage>} />
          <Route path="profile/skills" element={<GuestRestrictedPage><ProfilePage /></GuestRestrictedPage>} />
          <Route path="profile/posts" element={<GuestRestrictedPage><ProfilePage /></GuestRestrictedPage>} />
          <Route path="profile/photos" element={<GuestRestrictedPage><ProfilePage /></GuestRestrictedPage>} />
          <Route path="profile/video" element={<GuestRestrictedPage><ProfilePage /></GuestRestrictedPage>} />
          <Route path="profile/:userId" element={<GuestRestrictedPage><UserProfilePage /></GuestRestrictedPage>} />
          <Route path="profile/:userId/about" element={<GuestRestrictedPage><UserProfilePage /></GuestRestrictedPage>} />
          <Route path="profile/:userId/personalInfo" element={<GuestRestrictedPage><UserProfilePage /></GuestRestrictedPage>} />
          <Route path="profile/:userId/skills" element={<GuestRestrictedPage><UserProfilePage /></GuestRestrictedPage>} />
          <Route path="profile/:userId/posts" element={<GuestRestrictedPage><UserProfilePage /></GuestRestrictedPage>} />
          <Route path="profile/:userId/photos" element={<GuestRestrictedPage><UserProfilePage /></GuestRestrictedPage>} />
          <Route path="profile/:userId/video" element={<GuestRestrictedPage><UserProfilePage /></GuestRestrictedPage>} />

          <Route path="words-notes" element={<GuestRestrictedPage><WordsNotesLayout /></GuestRestrictedPage>}>
            <Route index element={<Navigate to="topics" replace />} />
            <Route path="topics" element={<VocabularyTopicsTab />} />
            <Route path="notes" element={<VocabularyNotesPanel />} />
            <Route path="my-words" element={<VocabularyMyWordsPanel />} />
          </Route>
          <Route path="vocabularyhome" element={<Navigate to="/words-notes/topics" replace />} />
          <Route path="topic/:topicId" element={<GuestRestrictedPage><TopicDetailPage /></GuestRestrictedPage>} />
          <Route path="topic/:topicId/flashcard" element={<GuestRestrictedPage><FlashCardPage /></GuestRestrictedPage>} />
          <Route path="topic/:topicId/data" element={<GuestRestrictedPage><VocabularyDataPage /></GuestRestrictedPage>} />
          <Route path="topic/:topicId/learn" element={<GuestRestrictedPage><LearnPage /></GuestRestrictedPage>} />
          <Route path="topic/:topicId/match" element={<GuestRestrictedPage><MatchGamePage /></GuestRestrictedPage>} />
          <Route path="topic/:topicId/test" element={<GuestRestrictedPage><TestPage /></GuestRestrictedPage>} />
          <Route path="settings" element={<GuestRestrictedPage><SettingsPage /></GuestRestrictedPage>} />
          <Route path="notifications" element={<GuestRestrictedPage><NotificationsPage /></GuestRestrictedPage>} />
        </Route>

        <Route path="/manage/*" element={<LegacyManageRedirect />} />

        <Route path="/mod/:userId/admin/users" element={<LegacyModAdminUsersRedirect />} />
        <Route path="/mod/:userId/admin/reports" element={<LegacyModAdminReportsRedirect />} />

        <Route path="/adminstrator/:userId" element={<StaffPortalLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<RequireAdmin><AdminOverviewPage /></RequireAdmin>} />
          <Route path="users" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
          <Route path="reports" element={<RequireAdmin><AdminReportsPage /></RequireAdmin>} />
        </Route>

        <Route path="/mod/:userId" element={<StaffPortalLayout />}>
          <Route index element={<ModPortalIndexRedirect />} />
          <Route element={<RequireModeratorStaffRoutes />}>
            <Route path="over-view" element={<StaffManageHomePage />} />
            <Route path="lessons" element={<ManageLessonsListPage mode="lesson" />} />
            <Route path="lessons/new" element={<ManageLessonsPage />} />
            <Route path="lessons/:id" element={<ManageLessonsPage />} />
            <Route path="skills" element={<ManageLessonsListPage mode="practice" />} />
            <Route path="skills/new" element={<ManageLessonsPage />} />
            <Route path="skills/:id" element={<ManageLessonsPage />} />
            <Route path="quests" element={<ManageQuestsListPage />} />
            <Route path="quests/new" element={<ManageQuestsPage />} />
            <Route path="quests/:id" element={<ManageQuestsPage />} />
            <Route path="challenges" element={<ManageChallengesListPage />} />
            <Route path="challenges/new" element={<ManageChallengesPage />} />
            <Route path="challenges/:id" element={<ManageChallengesPage />} />
            <Route path="entertainment" element={<StaffEntertainmentHomePage />} />
            <Route path="word-scramble" element={<ManageWordScramblePage />} />
            <Route path="achievements" element={<AchievementsPage embedded />} />
            <Route path="mock-tests" element={<ManageLessonsListPage mode="mock-test" />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      {/* RENDER MODAL ON TOP OF BACKGROUND */}
      {background && (
        <Routes>
          <Route path="post/photo/:postId" element={<PostPhotoPage />} />
          <Route path="post/:postId" element={<PostDetailPage />} />
        </Routes>
      )}
      </PostFeedSyncProvider>
    </AuthProvider>
  )
}

export default App


