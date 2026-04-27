import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../constants'

/**
 * Khu nội dung moderator (bài học, quest, …). Admin chỉ dùng 2 tab Users/Reports — chuyển hướng nếu admin vào URL mod cũ.
 */
export function RequireModeratorStaffRoutes() {
  const { isAdmin, user } = useAuth()
  if (isAdmin && user?.id) {
    return <Navigate to={ROUTES.MANAGE_ADMIN_OVERVIEW(user.id)} replace />
  }
  return <Outlet />
}
