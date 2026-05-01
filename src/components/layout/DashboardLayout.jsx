import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../constants'
import { AppHeader } from './AppHeader'
import { ChatbotButton } from '../ui/chatbot/ChatbotButton'

// Hide chatbot button on lesson/practice doing pages (reading/listening/writing by id), show on result and others
const isLessonDoingPage = (pathname) =>
  /^\/(lesson|practice)\/(reading|listening|writing)\/[^/]+$/.test(pathname)

const isFullScreenGame = (pathname) =>
  pathname === ROUTES.SKILLS.ENTERTAINMENT_WORD_SCRAMBLE ||
  pathname.startsWith(`${ROUTES.SKILLS.ENTERTAINMENT_WORD_SCRAMBLE}/lobby/`) ||
  pathname.startsWith(`${ROUTES.SKILLS.ENTERTAINMENT_WORD_SCRAMBLE}/roomId=`) ||
  pathname === ROUTES.SKILLS.ENTERTAINMENT_SNAKE_WORD ||
  pathname.startsWith(`${ROUTES.SKILLS.ENTERTAINMENT_SNAKE_WORD}/lobby/`) ||
  pathname.startsWith(`${ROUTES.SKILLS.ENTERTAINMENT_SNAKE_WORD}/roomId=`)

export function DashboardLayout() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const fullScreenGame = isFullScreenGame(location.pathname)
  const hideChatbot = isLessonDoingPage(location.pathname) || fullScreenGame

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return (
    <div className="bg-background-dark text-white h-screen flex flex-col w-full min-w-0 overflow-hidden">
      {!fullScreenGame && <AppHeader />}
      <div
        className={
          fullScreenGame
            ? 'flex-1 min-h-0 overflow-hidden flex flex-col'
            : 'flex-1 min-h-0 overflow-y-auto overflow-x-clip'
        }
      >
        <Outlet />
      </div>
      {!hideChatbot && <ChatbotButton />}
    </div>
  )
}
