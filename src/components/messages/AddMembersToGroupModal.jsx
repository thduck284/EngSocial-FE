import { useState, useEffect } from 'react'
import { conversationService, friendsService } from '../../services'

export function AddMembersToGroupModal({ t, open, onClose, selected, currentUserId, onSuccess }) {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [error, setError] = useState(null)

  const memberCount = selected?.memberCount ?? 0
  const maxMembers = selected?.maxMembers ?? 50
  const existingIds = new Set((selected?.members ?? []).map((m) => m.userId))
  const maxCanAdd = Math.max(0, maxMembers - memberCount)
  const maxSelect = Math.min(maxCanAdd, 50)

  useEffect(() => {
    if (!open || !selected?.id) return
    const existing = new Set((selected?.members ?? []).map((m) => m.userId))
    setSelectedIds(new Set())
    setError(null)
    setLoading(true)
    friendsService
      .getList({ limit: 100 })
      .then((res) => {
        const raw = res?.data?.data ?? res?.data ?? []
        const list = Array.isArray(raw) ? raw : []
        const normalized = list
          .map((item) => {
            const u = item?.user ?? item
            const id = (u?.id ?? u?._id)?.toString()
            return id ? { id, _id: id, name: u?.name ?? 'User', avatar: u?.avatar ?? null } : null
          })
          .filter(Boolean)
          .filter((f) => !existing.has(f.id))
        setFriends(normalized)
      })
      .catch(() => setFriends([]))
      .finally(() => setLoading(false))
  }, [open, selected?.id, selected?.members])

  const toggleMember = (id) => {
    const sid = String(id)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(sid)) next.delete(sid)
      else if (next.size < maxSelect) next.add(sid)
      return next
    })
  }

  const handleSubmit = async () => {
    const conversationId = selected?.id
    if (!conversationId || selectedIds.size === 0) return
    setError(null)
    setSubmitLoading(true)
    try {
      await conversationService.addMembersToGroup(conversationId, [...selectedIds])
      onSuccess?.()
      onClose()
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? t('common.error')
      setError(typeof msg === 'string' ? msg : t('common.error'))
    } finally {
      setSubmitLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-border-dark flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 dark:border-border-dark">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('messages.addMember')}</h3>
        </div>
        <div className="p-5 flex-1 overflow-y-auto">
          {maxCanAdd <= 0 ? (
            <p className="text-sm text-slate-400 dark:text-gray-500 py-4">{t('messages.groupMaxMembersReached')}</p>
          ) : (
            <>
              <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">{t('messages.selectMembers')}</p>
              {loading ? (
                <div className="flex justify-center py-8 text-slate-400 dark:text-gray-500">
                  <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                </div>
              ) : friends.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-gray-500 py-4">{t('messages.noFriendsToAddToGroup')}</p>
              ) : (
                <>
                  <p className="text-xs text-slate-400 dark:text-gray-500 mb-2">
                    {t('messages.membersSelected', { count: selectedIds.size, max: maxSelect })}
                  </p>
                  <ul className="space-y-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-card-dark/50 p-2">
                    {friends.map((friend) => {
                      const id = friend.id ?? friend._id
                      const sid = String(id)
                      const checked = selectedIds.has(sid)
                      const disabled = !checked && selectedIds.size >= maxSelect
                      return (
                        <li key={sid}>
                          <label
                            className={`flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={disabled}
                              onChange={() => toggleMember(id)}
                              className="rounded border-slate-300 dark:border-gray-500 text-primary focus:ring-primary"
                            />
                            <img
                              src={
                                friend.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name || '')}&background=13b6ec&color=fff`
                              }
                              alt=""
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="text-sm text-slate-800 dark:text-gray-200 truncate">{friend.name || 'User'}</span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
              {error && <p className="text-sm text-red-600 dark:text-red-400 mt-3">{error}</p>}
            </>
          )}
        </div>
        <div className="p-5 border-t border-slate-200 dark:border-border-dark flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 text-sm font-medium"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitLoading || selectedIds.size === 0 || maxCanAdd <= 0}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
          >
            {submitLoading && <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>}
            {t('messages.addMember')}
          </button>
        </div>
      </div>
    </div>
  )
}
