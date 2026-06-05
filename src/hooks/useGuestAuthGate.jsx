import { useCallback, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { GuestAuthModal } from '../components/auth/GuestAuthModal'

export function useGuestAuthGate() {
  const { isGuest } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)

  const requireAuth = useCallback(
    (action) => {
      if (isGuest) {
        setModalOpen(true)
        return false
      }
      if (typeof action === 'function') action()
      return true
    },
    [isGuest],
  )

  const guestModal = (
    <GuestAuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
  )

  return {
    isGuest,
    requireAuth,
    openGuestModal: () => setModalOpen(true),
    guestModal,
  }
}
