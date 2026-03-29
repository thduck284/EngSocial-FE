import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../constants'

/** Chỉ role admin (ví dụ trang hệ thống / API chỉ admin). Quest/challenge staff dùng mod+admin. */
export function RequireAdmin({ children }) {
  const { isAdmin, user } = useAuth()
  const location = useLocation()
  if (!isAdmin) {
    const fallback = user?.id != null ? ROUTES.MANAGE_OVERVIEW(user.id) : ROUTES.HOME
    return <Navigate to={fallback} replace state={{ from: location, staffAdminOnly: true }} />
  }
  return children
}
