import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../constants'
import { AppHeader } from './AppHeader'
import { ChatbotButton } from '../ui/ChatbotButton'

export function DashboardLayout() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return (
    <div className="bg-background-dark text-white min-h-screen">
      <AppHeader />
      <Outlet />
      <ChatbotButton />
    </div>
  )
}
