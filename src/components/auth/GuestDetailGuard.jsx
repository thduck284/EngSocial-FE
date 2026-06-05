import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../constants'
import { GuestAuthModal } from './GuestAuthModal'

/** Chặn trang chi tiết/luyện tập khi guest — hiện modal yêu cầu đăng nhập. */
export function GuestDetailGuard({ children, fallback = ROUTES.LESSON }) {
  const { isGuest } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(isGuest)

  useEffect(() => {
    setOpen(isGuest)
  }, [isGuest])

  if (!isGuest) return children

  return (
    <>
      <GuestAuthModal
        open={open}
        onClose={() => {
          setOpen(false)
          navigate(fallback, { replace: true })
        }}
      />
    </>
  )
}
