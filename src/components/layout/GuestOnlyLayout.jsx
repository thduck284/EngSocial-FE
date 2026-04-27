import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../constants'
import { getPostLoginNavigatePath } from '../../utils/auth'

/**
 * Chỉ cho truy cập khi chưa đăng nhập (guest).
 * Đã đăng nhập → user về home; admin/moderator về dashboard quản trị.
 */
export function GuestOnlyLayout() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={getPostLoginNavigatePath(ROUTES.HOME)} replace />
  }

  return <Outlet />
}
