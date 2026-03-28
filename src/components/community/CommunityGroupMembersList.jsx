import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { groupService } from '../../services/group.service'
import { friendsService } from '../../services/friends.service'
import { conversationService } from '../../services/conversation.service'
import { normalizeFriendsFromResponse } from '../../utils/profile'
import { DEFAULT_AVATAR } from '../../constants/ui'

export function normalizeGroupMemberRow(m) {
  const u = m?.user
  const uid = m?.userId
  const id = u?.id || u?._id || (typeof uid === 'object' && uid ? uid._id || uid.id : uid)
  if (!id) return null
  return {
    id: String(id),
    name: u?.name || m?.name || '',
    avatar: u?.avatar || m?.avatar || null,
    role: m?.role,
  }
}

function canKickTargetMember(viewerRole, targetRole, isSelf) {
  if (isSelf || !viewerRole) return false
  const tr = targetRole || 'member'
  if (tr === 'owner') return false
  if (viewerRole === 'owner') return true
  if (viewerRole === 'admin') return tr !== 'admin'
  return false
}

/**
 * @param {object} props
 * @param {string|null} props.groupId
 * @param {boolean} props.enabled — fetch khi true (modal mở hoặc tab People)
 * @param {'bare'|'embedded'} props.variant — bare: chỉ vùng cuộn (trong modal); embedded: card đầy đủ trên trang
 * @param {() => void} [props.onBeforeProfileNavigate]
 * @param {() => void} [props.onBeforeMessageNavigate]
 * @param {(userId: string, groupId: string) => void} [props.onMemberRemovedFromGroup]
 */
export function CommunityGroupMembersList({
  groupId,
  enabled,
  variant = 'embedded',
  onBeforeProfileNavigate,
  onBeforeMessageNavigate,
  onMemberRemovedFromGroup,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const myId =
    user?.id != null && user?.id !== '' ? String(user.id) : user?._id != null ? String(user._id) : ''

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [connectedIds, setConnectedIds] = useState(() => new Set())
  const [pendingSentIds, setPendingSentIds] = useState(() => new Set())
  const [friendActionUserId, setFriendActionUserId] = useState(null)
  const [messageBusyId, setMessageBusyId] = useState(null)
  const [myRole, setMyRole] = useState(null)
  const [kickBusyId, setKickBusyId] = useState(null)

  const refreshFriendSets = useCallback(async () => {
    if (!myId) {
      setConnectedIds(new Set())
      setPendingSentIds(new Set())
      return
    }
    try {
      const [listRes, sentRes] = await Promise.all([
        friendsService.getList({ limit: 200 }),
        friendsService.getSentRequests({ limit: 100 }),
      ])
      const friends = normalizeFriendsFromResponse(listRes)
      const connected = new Set(friends.map((f) => String(f.id)))
      const rawSent = sentRes?.data?.data ?? sentRes?.data ?? []
      const sentList = Array.isArray(rawSent) ? rawSent : []
      const pendingSent = new Set(
        sentList
          .map((r) => {
            const to = r?.to || {}
            return String(to?.id ?? to?._id ?? '')
          })
          .filter(Boolean)
      )
      setConnectedIds(connected)
      setPendingSentIds(pendingSent)
    } catch {
      setConnectedIds(new Set())
      setPendingSentIds(new Set())
    }
  }, [myId])

  useEffect(() => {
    if (!enabled) {
      setMembers([])
      setMyRole(null)
      return
    }
    refreshFriendSets()
  }, [enabled, refreshFriendSets])

  useEffect(() => {
    if (!enabled || !groupId) return
    let cancelled = false
    setLoading(true)
    setMembers([])

    ;(async () => {
      try {
        const all = []
        const limit = 50
        let page = 1
        const maxPages = 80

        while (!cancelled && page <= maxPages) {
          // eslint-disable-next-line no-await-in-loop
          const memRes = await groupService.members(groupId, { page, limit })
          const memList = memRes?.data?.data || memRes?.data?.members || memRes?.data || []
          if (!Array.isArray(memList)) break

          for (const m of memList) {
            const row = normalizeGroupMemberRow(m)
            if (row) all.push(row)
          }

          if (memList.length < limit) break
          page += 1
        }

        if (!cancelled) {
          all.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }))
          setMembers(all)
          const selfRow = myId ? all.find((r) => String(r.id) === myId) : null
          setMyRole(selfRow?.role ?? null)
        }
      } catch {
        if (!cancelled) {
          setMembers([])
          setMyRole(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [enabled, groupId, myId])

  const handleAddFriend = async (userId) => {
    if (!userId || friendActionUserId) return
    setFriendActionUserId(userId)
    try {
      await friendsService.sendRequest(userId)
      setPendingSentIds((prev) => {
        const next = new Set(prev)
        next.add(String(userId))
        return next
      })
    } catch {
      await refreshFriendSets()
    } finally {
      setFriendActionUserId(null)
    }
  }

  const openMessage = async (userId) => {
    if (!userId || messageBusyId) return
    setMessageBusyId(userId)
    try {
      const res = await conversationService.getOrCreateWithUser(userId)
      const conv =
        res?.data?.conversation ||
        res?.data?.data?.conversation ||
        res?.conversation ||
        res?.data
      const convId = conv?.id ?? conv?._id
      if (convId) {
        onBeforeMessageNavigate?.()
        navigate(`/messages/conversation/${convId}`)
      }
    } catch {
      // ignore
    } finally {
      setMessageBusyId(null)
    }
  }

  const goProfile = (id) => {
    onBeforeProfileNavigate?.()
    navigate(`/profile/${id}`)
  }

  const handleKickMember = async (userId, displayName) => {
    if (!groupId || !userId || kickBusyId) return
    const msg = t('groups.membersModal.kickConfirm', {
      defaultValue: 'Loại {{name}} khỏi nhóm?',
      name: displayName || t('groups.membersModal.unnamed', { defaultValue: 'Thành viên' }),
    })
    if (!window.confirm(msg)) return
    setKickBusyId(userId)
    try {
      await groupService.removeMember(groupId, userId)
      setMembers((prev) => prev.filter((x) => String(x.id) !== String(userId)))
      onMemberRemovedFromGroup?.(String(userId), String(groupId))
    } catch {
      // ignore; có thể mở rộng toast sau
    } finally {
      setKickBusyId(null)
    }
  }

  const membersWord = t('groups.header.members', { defaultValue: 'thành viên' })

  const listInner =
    loading ? (
      <p className="text-xs text-slate-500 px-2 py-4">
        {t('groups.membersModal.loading', { defaultValue: 'Đang tải...' })}
      </p>
    ) : members.length === 0 ? (
      <p className="text-xs text-slate-500 px-2 py-4">
        {t('groups.membersModal.empty', { defaultValue: 'Chưa có thành viên.' })}
      </p>
    ) : (
      <ul className="space-y-1 w-full">
        {members.map((m) => {
          const isSelf = myId && String(m.id) === myId
          const isFriend = connectedIds.has(String(m.id))
          const pendingSent = pendingSentIds.has(String(m.id))
          const showKick =
            myRole &&
            canKickTargetMember(myRole, m.role, Boolean(isSelf))
          return (
            <li
              key={m.id}
              className="flex w-full items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-900/80"
            >
              <button
                type="button"
                className="flex items-center gap-3 min-w-0 flex-1 text-left"
                onClick={() => goProfile(m.id)}
              >
                <div className="size-10 rounded-full border border-slate-700 bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={m.avatar || DEFAULT_AVATAR}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-100 truncate">
                    {m.name || t('groups.membersModal.unnamed', { defaultValue: 'Thành viên' })}
                  </p>
                  {isSelf ? (
                    <p className="text-[11px] text-slate-500">
                      {t('groups.membersModal.you', { defaultValue: 'Bạn' })}
                    </p>
                  ) : null}
                </div>
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                {!isSelf && !isFriend && !pendingSent ? (
                  <button
                    type="button"
                    disabled={!!friendActionUserId}
                    onClick={() => handleAddFriend(m.id)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-600 disabled:opacity-50"
                  >
                    {friendActionUserId === m.id
                      ? t('common.loading', { defaultValue: '...' })
                      : t('groups.membersModal.addFriend', { defaultValue: 'Thêm bạn bè' })}
                  </button>
                ) : null}
                {!isSelf && isFriend ? (
                  <span className="text-[10px] text-slate-500 px-1 max-w-[4.5rem] truncate">
                    {t('groups.membersModal.isFriend', { defaultValue: 'Đã kết bạn' })}
                  </span>
                ) : null}
                {!isSelf && pendingSent && !isFriend ? (
                  <span className="text-[10px] text-amber-400/90 px-1 max-w-[5rem]">
                    {t('groups.membersModal.requestSent', { defaultValue: 'Đã gửi lời mời' })}
                  </span>
                ) : null}
                {!isSelf ? (
                  <button
                    type="button"
                    disabled={!!messageBusyId}
                    onClick={() => openMessage(m.id)}
                    className="size-9 rounded-full flex items-center justify-center text-slate-200 hover:bg-slate-800 border border-slate-700 disabled:opacity-50"
                    title={t('groups.membersModal.message', { defaultValue: 'Nhắn tin' })}
                    aria-label={t('groups.membersModal.message', { defaultValue: 'Nhắn tin' })}
                  >
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                  </button>
                ) : null}
                {showKick ? (
                  <button
                    type="button"
                    disabled={!!kickBusyId}
                    onClick={() => handleKickMember(m.id, m.name)}
                    className="size-9 rounded-full flex items-center justify-center text-rose-300 hover:bg-rose-950/50 border border-rose-900/60 disabled:opacity-50"
                    title={t('groups.membersModal.kickMember', { defaultValue: 'Loại khỏi nhóm' })}
                    aria-label={t('groups.membersModal.kickMember', { defaultValue: 'Loại khỏi nhóm' })}
                  >
                    <span className="material-symbols-outlined text-[20px]">person_remove</span>
                  </button>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    )

  if (variant === 'bare') {
    return (
      <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar min-h-0">{listInner}</div>
    )
  }

  /* Tab People: list dọc trong card có max-height, cuộn bên trong */
  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col overflow-hidden min-h-0 max-h-[min(70vh,calc(100dvh-10rem))] sm:max-h-[min(75vh,calc(100dvh-9rem))]">
      <div className="px-5 py-4 border-b border-slate-800 shrink-0">
        <h2 className="text-base font-bold text-slate-100">
          {t('groups.main.membersTitle', { defaultValue: 'Thành viên' })}{' '}
          <span className="text-slate-400 font-normal">
            · {loading ? '…' : members.length} {membersWord}
          </span>
        </h2>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 custom-scrollbar">
        {listInner}
      </div>
    </div>
  )
}
