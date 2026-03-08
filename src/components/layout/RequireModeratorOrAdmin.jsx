import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../constants'

/**
 * Chỉ cho phép moderator hoặc admin. Nếu không đủ quyền thì redirect về trang chủ.
 */
export function RequireModeratorOrAdmin({ children }) {
  const { isModerator, isAdmin } = useAuth()
  const location = useLocation()
  const allowed = isModerator || isAdmin
  if (!allowed) {
    return <Navigate to={ROUTES.HOME} state={{ from: location }} replace />
  }
  return children
}
