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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-[2.5rem] w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
          <div>
            <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {t('groups.inviteModal.title', { defaultValue: 'Mời bạn bè vào nhóm' })}
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-bold mt-0.5">
              {t('groups.inviteModal.subtitle', {
                defaultValue: 'Gợi ý bên dưới là danh sách bạn bè (chưa có trong nhóm).',
              })}
            </p>
          </div>
          <button
            type="button"
            className="size-10 flex items-center justify-center rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-gray-400 transition-all"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="px-8 py-5 border-b border-slate-100 dark:border-white/5 space-y-3 bg-slate-50/50 dark:bg-transparent">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none shadow-sm"
              placeholder={t('groups.inviteModal.searchPlaceholder', {
                defaultValue: 'Tìm theo tên (mọi người dùng)...',
              })}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-snug font-medium italic">
            {t('groups.inviteModal.searchHint', {
              defaultValue:
                'Gõ tên trong ô tìm để tìm thêm người trên EngSocial — kể cả chưa là bạn bè.',
            })}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1.5 custom-scrollbar">
          {listLoading ? (
            <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
              <p className="text-xs font-bold uppercase tracking-widest">
                {searching
                  ? t('groups.inviteModal.searching', { defaultValue: 'Đang tìm...' })
                  : t('groups.inviteModal.loading', {
                      defaultValue: 'Đang tải danh sách bạn bè...',
                    })}
              </p>
            </div>
          ) : displayPeople.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-3 opacity-20">person_off</span>
              <p className="text-xs font-bold">
                {searching
                  ? t('groups.inviteModal.noSearchResults', {
                      defaultValue: 'Không tìm thấy ai với từ khóa này.',
                    })
                  : t('groups.inviteModal.noResults', {
                      defaultValue: 'Không còn bạn bè nào để mời (hoặc đã ở trong nhóm).',
                    })}
              </p>
            </div>
          ) : (
            displayPeople.map((f) => {
              const id = f.id || f._id || f.userId
              const selected = selectedIds.includes(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleSelect(id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left gap-3 transition-all border group ${
                    selected ? 'bg-primary/5 border-primary shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-white/5 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="size-11 rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs text-slate-400 shrink-0 shadow-sm transition-transform group-hover:scale-105">
                      <img
                        src={f.avatar || DEFAULT_AVATAR}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-sm transition-colors ${selected ? 'font-black text-primary' : 'font-bold text-slate-900 dark:text-slate-100'}`}>
                          {f.name || f.fullName}
                        </span>
                        {searching ? statusBadge(f.friendStatus || 'none') : null}
                      </div>
                      {f.email ? (
                        <span className="text-[11px] text-slate-500 dark:text-gray-500 truncate font-medium">{f.email}</span>
                      ) : null}
                    </div>
                  </div>
                  <div
                    className={`size-6 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
                      selected ? 'border-primary bg-primary scale-110 shadow-lg shadow-primary/25' : 'border-slate-200 dark:border-white/10 bg-transparent group-hover:border-primary/40'
                    }`}
                  >
                    {selected && (
                      <span className="material-symbols-outlined text-base font-black text-white">
                        check
                      </span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>

        <div className="px-8 py-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-transparent shrink-0">
          <div className="flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
              {t('groups.inviteModal.selectedCount', { defaultValue: 'Đã chọn' })}
            </p>
            <p className="text-sm font-black text-primary">
              {selectedIds.length} {t('common.people', { defaultValue: 'người' })}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all active:scale-95"
              onClick={onClose}
            >
              {t('groups.inviteModal.close', { defaultValue: 'Đóng' })}
            </button>
            <button
              type="button"
              className="px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/25 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
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
                : t('groups.inviteModal.add', { defaultValue: 'Gửi lời mời' })}
            </button>
          </div>
        </div>
      </div>
    </div>

  )
}
