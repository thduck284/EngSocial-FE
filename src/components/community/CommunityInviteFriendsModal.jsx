import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { friendsService } from '../../services/friends.service'
import { groupService } from '../../services/group.service'
import { DEFAULT_AVATAR } from '../../constants/ui'

function normalizeSearchUser(item) {
  if (!item) return null
  const id = item.id || item.userId || item._id
  if (!id) return null
  return {
    id,
    name: item.name || item.fullName || '',
    avatar: item.avatar || null,
    email: item.email || '',
    friendStatus: item.friendStatus || 'none',
  }
}

export function CommunityInviteFriendsModal({ open, onClose, groupId, onInviteSent }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [friends, setFriends] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [groupMemberIds, setGroupMemberIds] = useState([])
  const [loadingGroupMembers, setLoadingGroupMembers] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setSelectedIds([])
      setSearchResults([])
      return
    }
    let cancelled = false
    ;(async () => {
      setLoadingFriends(true)
      try {
        const res = await friendsService.getList({ page: 1, limit: 100 })
        const list = res?.data?.data || res?.data?.friends || res?.data || []

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
        if (!cancelled) setLoadingFriends(false)
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
        const maxPages = 40

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

        try {
          const jr = await groupService.joinRequests(groupId)
          const jrPayload = jr?.data ?? jr
          const reqList = jrPayload?.requests ?? jrPayload?.data?.requests ?? []
          if (Array.isArray(reqList)) {
            for (const m of reqList) {
              const uid = m?.user?.id || m?.user?._id || m?.userId
              const sid =
                uid && typeof uid === 'object'
                  ? String(uid._id || uid.id || '')
                  : uid != null
                    ? String(uid)
                    : ''
              if (sid) existing.add(sid)
            }
          }
          const invitedIds =
            jrPayload?.invitedPendingUserIds ?? jrPayload?.data?.invitedPendingUserIds ?? []
          if (Array.isArray(invitedIds)) {
            invitedIds.forEach((id) => {
              if (id != null && id !== '') existing.add(String(id))
            })
          }
        } catch {
          // Không có quyền xem join-requests: bỏ qua (vd. thành viên không phải admin)
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

  const qTrim = query.trim()
  const searching = qTrim.length > 0

  useEffect(() => {
    if (!open || !searching) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }

    let cancelled = false
    const handle = setTimeout(() => {
      ;(async () => {
        setSearchLoading(true)
        try {
          const res = await friendsService.search({
            q: qTrim,
            limit: 30,
            page: 1,
            friendFilter: 'all',
          })
          const list =
            res?.data?.data?.items ??
            res?.data?.data ??
            res?.data?.friends ??
            res?.data ??
            []
          const normalized = Array.isArray(list)
            ? list.map(normalizeSearchUser).filter(Boolean)
            : []
          if (!cancelled) setSearchResults(normalized)
        } catch {
          if (!cancelled) setSearchResults([])
        } finally {
          if (!cancelled) setSearchLoading(false)
        }
      })()
    }, 320)

    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [open, searching, qTrim])

  const groupMemberSet = useMemo(
    () => new Set(groupMemberIds.map((id) => String(id))),
    [groupMemberIds]
  )

  const friendSuggestions = useMemo(
    () =>
      friends.filter((f) => {
        const uid = String(f.id || f._id || f.userId || '')
        return uid && !groupMemberSet.has(uid)
      }),
    [friends, groupMemberSet]
  )

  const searchList = useMemo(
    () => searchResults.filter((u) => u.id && !groupMemberSet.has(String(u.id))),
    [searchResults, groupMemberSet]
  )

  const displayPeople = searching ? searchList : friendSuggestions
  const listLoading = searching ? searchLoading : loadingFriends || loadingGroupMembers

  const toggleSelect = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const statusBadge = (friendStatus) => {
    if (friendStatus === 'connected')
      return (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
          {t('groups.inviteModal.badgeFriend')}
        </span>
      )
    if (friendStatus === 'pending')
      return (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 shrink-0">
          {t('groups.inviteModal.badgePending')}
        </span>
      )
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-600/40 text-slate-300 shrink-0">
        {t('groups.inviteModal.badgeOther')}
      </span>
    )
  }

  if (!open) return null

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
                defaultValue: 'Gợi ý bên dưới là danh sách bạn bè (chưa có trong nhóm).',
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

        <div className="px-5 py-3 border-b border-slate-800 space-y-2">
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
                defaultValue: 'Tìm theo tên (mọi người dùng)...',
              })}
            />
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            {t('groups.inviteModal.searchHint', {
              defaultValue:
                'Gõ tên trong ô tìm để tìm thêm người trên EngSocial — kể cả chưa là bạn bè.',
            })}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2 custom-scrollbar">
          {listLoading ? (
            <p className="text-xs text-slate-500">
              {searching
                ? t('groups.inviteModal.searching', { defaultValue: 'Đang tìm...' })
                : t('groups.inviteModal.loading', {
                    defaultValue: 'Đang tải danh sách bạn bè...',
                  })}
            </p>
          ) : displayPeople.length === 0 ? (
            <p className="text-xs text-slate-500">
              {searching
                ? t('groups.inviteModal.noSearchResults', {
                    defaultValue: 'Không tìm thấy ai với từ khóa này.',
                  })
                : t('groups.inviteModal.noResults', {
                    defaultValue: 'Không còn bạn bè nào để mời (hoặc đã ở trong nhóm).',
                  })}
            </p>
          ) : (
            displayPeople.map((f) => {
              const id = f.id || f._id || f.userId
              const selected = selectedIds.includes(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleSelect(id)}
                  className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-left gap-2 ${
                    selected ? 'bg-primary/10 border border-primary/60' : 'hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="size-8 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center text-xs text-slate-400 shrink-0">
                      <img
                        src={f.avatar || DEFAULT_AVATAR}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-medium text-slate-100 truncate">
                          {f.name || f.fullName}
                        </span>
                        {searching ? statusBadge(f.friendStatus || 'none') : null}
                      </div>
                      {f.email ? (
                        <span className="text-[11px] text-slate-500 truncate">{f.email}</span>
                      ) : null}
                    </div>
                  </div>
                  <div
                    className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
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
              defaultValue: 'Đã chọn {{count}} người.',
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
                : t('groups.inviteModal.add', { defaultValue: 'Gửi lời mời (chờ duyệt)' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
