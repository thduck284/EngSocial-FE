export const GUEST_SESSION_KEY = 'guestSession'

export const GUEST_USER = {
  id: 'guest',
  name: 'Guest',
  role: 'user',
  isGuest: true,
}

export function isGuestSession() {
  return localStorage.getItem(GUEST_SESSION_KEY) === '1'
}

export function setGuestSession() {
  localStorage.setItem(GUEST_SESSION_KEY, '1')
  localStorage.setItem('user', JSON.stringify(GUEST_USER))
}

export function clearGuestSession() {
  localStorage.removeItem(GUEST_SESSION_KEY)
  const raw = localStorage.getItem('user')
  if (!raw) return
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.isGuest || parsed?.id === 'guest') {
      localStorage.removeItem('user')
    }
  } catch {
    localStorage.removeItem('user')
  }
}
