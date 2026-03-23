import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { friendsService } from '../../services/friends.service'
import { groupService } from '../../services/group.service'

export function CommunityInviteFriendsModal({ open, onClose, groupId }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [friends, setFriends] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [groupMemberIds, setGroupMemberIds] = useState([])
  const [loadingGroupMembers, setLoadingGroupMembers] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await friendsService.getList({ page: 1, limit: 100 })
        const list = res?.data?.data || res?.data?.friends || res?.data || []

        // Backend: GET /friends returns friendships, each has { user: { id, name, avatar, ... } }
        // Normalize to { id, name, avatar, email? }.
        const normalized = Array.isArray(list)
          ? list.map((f) => {
              const u = f?.user || f
              return {
                id: u?.id || u?._id || f?.id || f?._id || f?.userId,
                name: u?.name || f?.name || f?.fullName || '',
                avatar: u?.avatar || f?.avatar || '',
                email: u?.email || f?.email || '',
              }
            })
          : []

        if (!cancelled) setFriends(normalized.filter((x) => x.id))
      } catch {
        if (!cancelled) setFriends([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setGroupMemberIds([])
    setLoadingGroupMembers(true)

    ;(async () => {
      try {
        if (!groupId) return

        const existing = new Set()
        const limit = 50
        let page = 1
        let total = null
        const maxPages = 40 // cap: 40*50=2000

        // eslint-disable-next-line no-constant-condition
        while (true) {
          if (page > maxPages) break
          // eslint-disable-next-line no-await-in-loop
          const memRes = await groupService.members(groupId, { page, limit })
          const memList = memRes?.data?.data || memRes?.data?.members || memRes?.data || []

          memList.forEach((m) => {
            const uid = m?.user?.id || m?.userId || m?.user?._id || m?.id
            if (uid) existing.add(String(uid))
          })

          if (total == null) {
            total = memRes?.meta?.pagination?.total ?? null
          }

          if (total != null && existing.size >= total) break
          if (!Array.isArray(memList) || memList.length < limit) break

          page += 1
        }

        if (!cancelled) setGroupMemberIds(Array.from(existing))
      } catch {
        if (!cancelled) setGroupMemberIds([])
      } finally {
        if (!cancelled) setLoadingGroupMembers(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, groupId])

  if (!open) return null

  const toggleSelect = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const groupMemberSet = new Set(groupMemberIds.map((id) => String(id)))

  const filteredFriends = friends.filter((f) => {
    const uid = String(f.id || f._id || f.userId || '')
    const alreadyInGroup = uid ? groupMemberSet.has(uid) : false
    if (!query.trim()) return !alreadyInGroup
    const q = query.toLowerCase()
    const name = (f.name || f.fullName || '').toLowerCase()
    const email = (f.email || '').toLowerCase()
    const matchesQuery = name.includes(q) || email.includes(q)
    return matchesQuery && !alreadyInGroup
  })

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-100">
              {t('groups.inviteModal.title', { defaultValue: 'Mời bạn bè vào nhóm' })}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('groups.inviteModal.subtitle', {
                defaultValue: 'Chọn nhiều bạn bè để thêm vào nhóm này.',
              })}
            </p>
          </div>
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="px-5 py-3 border-b border-slate-800">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder={t('groups.inviteModal.searchPlaceholder', {
                defaultValue: 'Tìm kiếm theo tên hoặc email...',
              })}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2 custom-scrollbar">
          {loading ? (
            <p className="text-xs text-slate-500">
              {t('groups.inviteModal.loading', {
                defaultValue: 'Đang tải danh sách bạn bè...',
              })}
            </p>
          ) : filteredFriends.length === 0 ? (
            <p className="text-xs text-slate-500">
              {t('groups.inviteModal.noResults', {
                defaultValue: 'Không tìm thấy bạn bè phù hợp.',
              })}
            </p>
          ) : (
            filteredFriends.map((f) => {
              const id = f.id || f._id || f.userId
              const selected = selectedIds.includes(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleSelect(id)}
                  className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-left ${
                    selected ? 'bg-primary/10 border border-primary/60' : 'hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                      {f.avatar ? (
                        <img
                          src={f.avatar}
                          alt={f.name || f.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-sm">account_circle</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-100">
                        {f.name || f.fullName}
                      </span>
                      {f.email && (
                        <span className="text-[11px] text-slate-500 truncate">{f.email}</span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`size-4 rounded-full border flex items-center justify-center ${
                      selected ? 'border-primary bg-primary' : 'border-slate-600 bg-transparent'
                    }`}
                  >
                    {selected && (
                      <span className="material-symbols-outlined text-[14px] text-slate-950">
                        check
                      </span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            {t('groups.inviteModal.selected', {
              defaultValue: 'Đã chọn {{count}} bạn bè.',
              count: selectedIds.length,
            })}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-900"
              onClick={onClose}
            >
              {t('groups.inviteModal.close', { defaultValue: 'Đóng' })}
            </button>
            <button
              type="button"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={selectedIds.length === 0 || !groupId || submitting}
              onClick={async () => {
                if (!groupId || selectedIds.length === 0 || submitting) return
                try {
                  setSubmitting(true)
                  await groupService.addMembers(groupId, selectedIds)
                  onClose?.()
                } catch {
                  // Có thể thêm toast sau, tạm ignore lỗi
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              {submitting
                ? t('common.loading', { defaultValue: 'Đang xử lý...' })
                : t('groups.inviteModal.add', { defaultValue: 'Thêm vào nhóm' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

