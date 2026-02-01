import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../constants'

/**
 * Chỉ cho truy cập khi chưa đăng nhập (guest).
 * Đã đăng nhập → redirect về trang chủ.
 */
export function GuestOnlyLayout() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}
