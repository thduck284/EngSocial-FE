import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { restoreMainScrollY } from '../utils/scrollRestore'

/** Restores main scroll position after closing post detail modal (or similar overlays). */
export function useMainScrollRestore() {
  const location = useLocation()
  const navigate = useNavigate()
  const restoredRef = useRef(null)

  useEffect(() => {
    const scrollY = location.state?.restoreScrollY
    if (scrollY == null) {
      restoredRef.current = null
      return
    }

    const key = `${location.key}:${scrollY}`
    if (restoredRef.current === key) return
    restoredRef.current = key

    restoreMainScrollY(scrollY)

    const nextState = { ...(location.state || {}) }
    delete nextState.restoreScrollY
    navigate(
      { pathname: location.pathname, search: location.search, hash: location.hash },
      {
        replace: true,
        state: Object.keys(nextState).length > 0 ? nextState : undefined,
        preventScrollReset: true,
      }
    )
  }, [location.key, location.pathname, location.search, location.hash, location.state, navigate])
}
