import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { TermPage } from './pages/TermPage'
import { DashboardPage } from './pages/DashboardPage'
import { EnterPage } from './pages/EnterPage'
import { SkillPracticePage } from './pages/SkillPracticePage'
import { ListeningLessonPage } from './pages/ListeningLessonPage'
import { ReadingLessonPage } from './pages/ReadingLessonPage'
import { WritingLessonPage } from './pages/WritingLessonPage'
import { ProfilePage } from './pages/ProfilePage'
import { UserProfilePage } from './pages/UserProfilePage'
import { LessonsPage } from './pages/LessonsPage'
import { QuestsPage } from './pages/QuestsPage'
import { AchievementsPage } from './pages/AchievementsPage'
import { ManageLessonsPage } from './pages/ManageLessonsPage'
import { ManageQuestsPage } from './pages/ManageQuestsPage'
import { ManageChallengesPage } from './pages/ManageChallengesPage'
import { SearchPage } from './pages/SearchPage'
import { MessagesPage } from './pages/MessagesPage'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { RequireModeratorOrAdmin } from './components/layout/RequireModeratorOrAdmin'
import { GuestOnlyLayout } from './components/layout/GuestOnlyLayout'

function App() {
  return (
    <AuthProvider>
      <Routes>
      {/* Auth - chỉ khi chưa đăng nhập; đã đăng nhập thì redirect về / */}
      <Route element={<GuestOnlyLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>
      <Route path="/term" element={<TermPage />} />

      {/* Các route cần đăng nhập: DashboardLayout dùng useAuth() để redirect */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<DashboardPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="messages/conversation/:conversationId" element={<MessagesPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="enter" element={<EnterPage />} />
        <Route path="lesson" element={<LessonsPage />} />
        <Route path="lesson/reading/:id" element={<ReadingLessonPage />} />
        <Route path="lesson/listening/:id" element={<ListeningLessonPage />} />
        <Route path="lesson/writing/:id" element={<WritingLessonPage />} />
        <Route path="practice" element={<Navigate to="/skills/reading" replace />} />
        <Route path="skills" element={<Navigate to="/skills/reading" replace />} />
        <Route path="skills/:skill" element={<SkillPracticePage />} />
        <Route path="practice/reading/:id" element={<ReadingLessonPage />} />
        <Route path="practice/listening/:id" element={<ListeningLessonPage />} />
        <Route path="practice/writing/:id" element={<WritingLessonPage />} />
        <Route path="lessons" element={<Navigate to="/lesson" replace />} />
        <Route path="manage/lessons" element={<RequireModeratorOrAdmin><ManageLessonsPage /></RequireModeratorOrAdmin>} />
        <Route path="manage/lessons/:id" element={<RequireModeratorOrAdmin><ManageLessonsPage /></RequireModeratorOrAdmin>} />
        <Route path="manage/skills" element={<RequireModeratorOrAdmin><ManageLessonsPage /></RequireModeratorOrAdmin>} />
        <Route path="manage/skills/:id" element={<RequireModeratorOrAdmin><ManageLessonsPage /></RequireModeratorOrAdmin>} />
        <Route path="manage/quests" element={<RequireModeratorOrAdmin><ManageQuestsPage /></RequireModeratorOrAdmin>} />
        <Route path="manage/quests/:id" element={<RequireModeratorOrAdmin><ManageQuestsPage /></RequireModeratorOrAdmin>} />
        <Route path="manage/challenges" element={<RequireModeratorOrAdmin><ManageChallengesPage /></RequireModeratorOrAdmin>} />
        <Route path="manage/challenges/:id" element={<RequireModeratorOrAdmin><ManageChallengesPage /></RequireModeratorOrAdmin>} />
        <Route path="quests" element={<QuestsPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="profile/:userId" element={<UserProfilePage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
