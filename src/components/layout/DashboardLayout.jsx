import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../constants'
import { AppHeader } from './AppHeader'
import { ChatbotButton } from '../ui/chatbot/ChatbotButton'

// Hide chatbot button on lesson/practice doing pages (reading/listening/writing by id), show on result and others
const isLessonDoingPage = (pathname) =>
  /^\/(lesson|practice)\/(reading|listening|writing)\/[^/]+$/.test(pathname)

export function DashboardLayout() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const hideChatbot = isLessonDoingPage(location.pathname)

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return (
    <div className="bg-background-dark text-white h-screen flex flex-col w-full min-w-0 overflow-hidden">
      <AppHeader />
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-clip">
        <Outlet />
      </div>
      {!hideChatbot && <ChatbotButton />}
    </div>
  )
}
