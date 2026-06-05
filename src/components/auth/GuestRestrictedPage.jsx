import { useAuth } from '../../context/AuthContext'
import { GuestAuthRequiredCard } from './GuestAuthRequiredCard'

export function GuestRestrictedPage({ children }) {
  const { isGuest } = useAuth()
  if (isGuest) return <GuestAuthRequiredCard />
  return children
}
