import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'

const PostFeedSyncContext = createContext(null)

export function PostFeedSyncProvider({ children }) {
  const updatersRef = useRef(new Set())

  const registerPostUpdater = useCallback((updater) => {
    if (typeof updater !== 'function') return () => {}
    updatersRef.current.add(updater)
    return () => {
      updatersRef.current.delete(updater)
    }
  }, [])

  const syncPostUpdate = useCallback((postId, patch) => {
    if (!postId) return
    updatersRef.current.forEach((updater) => {
      try {
        updater(postId, patch)
      } catch {
        // ignore subscriber errors
      }
    })
  }, [])

  const value = useMemo(
    () => ({ registerPostUpdater, syncPostUpdate }),
    [registerPostUpdater, syncPostUpdate],
  )

  return <PostFeedSyncContext.Provider value={value}>{children}</PostFeedSyncContext.Provider>
}

export function usePostFeedSync() {
  return useContext(PostFeedSyncContext)
}

/** Register a feed/list updater while a page is mounted (e.g. home feed, community feed). */
export function useRegisterPostFeedSync(updater) {
  const ctx = usePostFeedSync()

  useEffect(() => {
    if (!ctx?.registerPostUpdater || typeof updater !== 'function') return undefined
    return ctx.registerPostUpdater(updater)
  }, [ctx, updater])
}
