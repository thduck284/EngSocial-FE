import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { TermPage } from './pages/TermPage'
import { DashboardPage } from './pages/DashboardPage'
import { EnterPage } from './pages/EnterPage'
import { SkillPracticePage } from './pages/SkillPracticePage'
import { ListeningLessonPage } from './pages/ListeningLessonPage'
import { DashboardLayout } from './components/layout/DashboardLayout'

function App() {
  return (
    <Routes>
      {/* Auth - full screen, no dashboard header */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/term" element={<TermPage />} />

      {/* Dashboard layout: header + outlet + chatbot */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="enter" element={<EnterPage />} />
        <Route path="skills" element={<Navigate to="/skills/reading" replace />} />
        <Route path="skills/:skill" element={<SkillPracticePage />} />
        <Route path="lesson/listening/:id" element={<ListeningLessonPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
