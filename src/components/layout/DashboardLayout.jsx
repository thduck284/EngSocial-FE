import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { ChatbotButton } from '../ui/ChatbotButton'

export function DashboardLayout() {
  return (
    <div className="bg-background-dark text-white min-h-screen">
      <AppHeader />
      <Outlet />
      <ChatbotButton />
    </div>
  )
}
