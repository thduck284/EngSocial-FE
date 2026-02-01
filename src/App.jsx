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
import { DashboardLayout } from './components/layout/DashboardLayout'
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
        <Route index element={<DashboardPage />} />
        <Route path="enter" element={<EnterPage />} />
        <Route path="skills" element={<Navigate to="/skills/reading" replace />} />
        <Route path="skills/:skill" element={<SkillPracticePage />} />
        <Route path="lesson/listening/:id" element={<ListeningLessonPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
