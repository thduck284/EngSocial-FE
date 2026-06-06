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
        <span className="text-[9px] px-1 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold">
          {t('groups.inviteModal.badgeFriend')}
        </span>
      )
    if (friendStatus === 'pending')
      return (
        <span className="text-[9px] px-1 py-0.5 rounded border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 font-bold">
          {t('groups.inviteModal.badgePending')}
        </span>
      )
    return (
      <span className="text-[9px] px-1 py-0.5 rounded border border-slate-200 dark:border-border-dark bg-slate-100 dark:bg-background-dark text-slate-500 dark:text-gray-400 shrink-0 font-bold">
        {t('groups.inviteModal.badgeOther')}
      </span>
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl w-full max-w-md shadow-sm flex flex-col max-h-[min(85vh,calc(100dvh-2rem))] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-border-dark flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {t('groups.inviteModal.title')}
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              {t('groups.inviteModal.subtitle')}
            </p>
          </div>
          <button
            type="button"
            className="size-8 shrink-0 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-background-dark text-slate-400 dark:text-gray-400 transition-colors"
            onClick={onClose}
            aria-label={t('groups.inviteModal.close')}
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="px-5 py-3 border-b border-slate-100 dark:border-border-dark space-y-2 bg-slate-50 dark:bg-background-dark/30">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-lg py-2 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              placeholder={t('groups.inviteModal.searchPlaceholder')}
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 leading-snug">
            {t('groups.inviteModal.searchHint')}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar min-h-0">
          {listLoading ? (
            <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
              <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
              <p className="text-xs font-bold">
                {searching ? t('groups.inviteModal.searching') : t('groups.inviteModal.loading')}
              </p>
            </div>
          ) : displayPeople.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-20">person_off</span>
              <p className="text-xs">
                {searching ? t('groups.inviteModal.noSearchResults') : t('groups.inviteModal.noResults')}
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left gap-2 transition-colors border ${
                    selected
                      ? 'bg-primary/5 border-primary/30'
                      : 'hover:bg-slate-50 dark:hover:bg-background-dark/60 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="size-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-background-dark flex items-center justify-center text-xs text-slate-400 shrink-0 border border-slate-200 dark:border-border-dark">
                      <img
                        src={f.avatar || DEFAULT_AVATAR}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-xs truncate transition-colors ${selected ? 'font-bold text-primary' : 'font-medium text-slate-900 dark:text-slate-100'}`}>
                          {f.name || f.fullName}
                        </span>
                        {searching ? statusBadge(f.friendStatus || 'none') : null}
                      </div>
                      {f.email ? (
                        <span className="text-[10px] text-slate-500 dark:text-gray-500 truncate">{f.email}</span>
                      ) : null}
                    </div>
                  </div>
                  <div
                    className={`size-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      selected
                        ? 'border-primary bg-primary'
                        : 'border-slate-200 dark:border-border-dark bg-transparent group-hover:border-primary/40'
                    }`}
                  >
                    {selected && (
                      <span className="material-symbols-outlined text-sm text-white">check</span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 dark:border-border-dark flex items-center justify-between gap-3 bg-slate-50 dark:bg-background-dark/30 shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500">
              {t('groups.inviteModal.selectedCount')}
            </p>
            <p className="text-xs font-bold text-primary">
              {selectedIds.length} {t('common.people')}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-border-dark hover:bg-slate-100 dark:hover:bg-background-dark transition-colors"
              onClick={onClose}
            >
              {t('groups.inviteModal.close')}
            </button>
            <button
              type="button"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:brightness-110 transition-colors disabled:opacity-50"
              disabled={selectedIds.length === 0 || !groupId || submitting}
              onClick={async () => {
                if (!groupId || selectedIds.length === 0 || submitting) return
                try {
                  setSubmitting(true)
                  await groupService.addMembers(groupId, selectedIds)
                  onInviteSent?.()
                  onClose?.()
                } catch {
                  // Có thể thêm toast sau, tạm ignore lỗi
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              {submitting ? t('common.loading') : t('groups.inviteModal.add')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
