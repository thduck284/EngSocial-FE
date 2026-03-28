import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { groupService } from '../../services/group.service'
import { DEFAULT_AVATAR } from '../../constants/ui'

function normalizeJoinRequestRow(m) {
  const u = m?.user
  const uid = m?.userId
  const id = u?.id || u?._id || (typeof uid === 'object' && uid ? uid._id || uid.id : uid)
  if (!id) return null
  return {
    id: String(id),
    name: u?.name || '',
    avatar: u?.avatar || null,
  }
}

/**
 * Card yêu cầu tham gia (chỉ hiện khi API cho phép — chủ nhóm / admin).
 * @param {{ groupId: string|null, enabled: boolean, groupType?: string, onJoinRequestApproved?: (p: { groupId: string, userPreview: object }) => void }} props
 */
export function CommunityGroupJoinRequestsCard({
  groupId,
  enabled,
  groupType,
  onJoinRequestApproved,
  refreshToken = 0,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [actionId, setActionId] = useState(null)

  const load = useCallback(async () => {
    if (!groupId) return
    setLoading(true)
    setForbidden(false)
    try {
      const res = await groupService.joinRequests(groupId)
      const payload = res?.data ?? res
      const list = payload?.requests ?? payload?.data?.requests ?? []
      const next = []
      if (Array.isArray(list)) {
        for (const m of list) {
          const r = normalizeJoinRequestRow(m)
          if (r) next.push(r)
        }
      }
      setRows(next)
    } catch (e) {
      if (e?.status === 403) {
        setForbidden(true)
        setRows([])
      } else {
        setRows([])
      }
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    if (!enabled || !groupId) {
      setRows([])
      setForbidden(false)
      return
    }
    load()
  }, [enabled, groupId, load, refreshToken])

  const approve = async (row) => {
    if (!groupId || !row?.id || actionId) return
    setActionId(row.id)
    try {
      await groupService.approveJoinRequest(groupId, row.id)
      setRows((prev) => prev.filter((r) => r.id !== row.id))
      onJoinRequestApproved?.({
        groupId: String(groupId),
        userPreview: { id: row.id, name: row.name, avatar: row.avatar },
      })
    } catch {
      await load()
    } finally {
      setActionId(null)
    }
  }

  const reject = async (row) => {
    if (!groupId || !row?.id || actionId) return
    setActionId(row.id)
    try {
      await groupService.rejectJoinRequest(groupId, row.id)
      setRows((prev) => prev.filter((r) => r.id !== row.id))
    } catch {
      await load()
    } finally {
      setActionId(null)
    }
  }

  if (!enabled || !groupId || forbidden) return null

  const isPublic = groupType === 'public'
  const hintKey = isPublic ? 'groups.joinRequests.hintPublic' : 'groups.joinRequests.hintPrivate'
  const hintDefault = isPublic
    ? 'Mọi người bấm «Tham gia» đều chờ duyệt (kể cả nhóm công khai). Duyệt tại đây. Người được mời nhận thông báo chuông và chấp nhận trên trang nhóm.'
    : 'Chỉ người tự xin vào nhóm (bấm «Tham gia»). Người được mời nhận thông báo và chấp nhận / từ chối trên trang nhóm — không nằm trong danh sách này.'

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 shrink-0">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-amber-400/90 text-xl shrink-0 mt-0.5">
            mark_email_unread
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-slate-100">
              {t('groups.joinRequests.title', { defaultValue: 'Yêu cầu tham gia' })}
              <span className="text-slate-400 font-normal text-sm ml-2">
                {loading ? '…' : rows.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 leading-snug mt-1.5">
              {t(hintKey, { defaultValue: hintDefault })}
            </p>
          </div>
        </div>
      </div>
      <div className="px-3 py-3 sm:px-4 sm:py-4">
        {loading ? (
          <p className="text-xs text-slate-500 px-2 py-2">
            {t('groups.joinRequests.loading', { defaultValue: 'Đang tải...' })}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-slate-500 px-2 py-2">
            {t('groups.joinRequests.empty', { defaultValue: 'Hiện không có yêu cầu nào đang chờ.' })}
          </p>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex w-full items-center gap-3 px-2 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80"
              >
                <button
                  type="button"
                  className="flex items-center gap-3 min-w-0 flex-1 text-left"
                  onClick={() => navigate(`/profile/${r.id}`)}
                >
                  <div className="size-10 rounded-full border border-slate-700 bg-slate-800 overflow-hidden shrink-0">
                    <img
                      src={r.avatar || DEFAULT_AVATAR}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-100 truncate">
                    {r.name || t('groups.membersModal.unnamed', { defaultValue: 'Thành viên' })}
                  </span>
                </button>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={!!actionId}
                    onClick={() => reject(r)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600 disabled:opacity-50"
                  >
                    {t('groups.joinRequests.reject', { defaultValue: 'Từ chối' })}
                  </button>
                  <button
                    type="button"
                    disabled={!!actionId}
                    onClick={() => approve(r)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-600/90 text-white hover:bg-emerald-500 border border-emerald-500/50 disabled:opacity-50"
                  >
                    {actionId === r.id
                      ? t('common.loading', { defaultValue: '...' })
                      : t('groups.joinRequests.approve', { defaultValue: 'Chấp nhận' })}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
