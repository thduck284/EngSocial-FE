import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { adminService } from '../services'
import { AdminUserDetailModal } from '../components/admin/AdminUserDetailModal'

const PAGE_SIZE = 15

const selectClass =
  'w-full max-w-[140px] bg-background-dark border border-border-dark rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-primary'

export function AdminUsersPage() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const myId = currentUser?.id ?? currentUser?._id

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pendingEdits, setPendingEdits] = useState({})
  const [savingId, setSavingId] = useState(null)
  const [detailUserId, setDetailUserId] = useState(null)

  useEffect(() => {
    const tmr = setTimeout(() => setSearchDebounced(search.trim()), 400)
    return () => clearTimeout(tmr)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [searchDebounced, roleFilter, statusFilter])

  const load = useCallback(() => {
    setError('')
    setLoading(true)
    adminService
      .getUsers({
        page,
        limit: PAGE_SIZE,
        search: searchDebounced || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : []
        setRows(list)
        setPagination(res?.meta?.pagination ?? null)
      })
      .catch(() => {
        setRows([])
        setPagination(null)
        setError(t('adminConsole.loadError'))
      })
      .finally(() => setLoading(false))
  }, [page, searchDebounced, roleFilter, statusFilter, t])

  useEffect(() => {
    load()
  }, [load])

  const initEditsForRows = useCallback((list) => {
    const next = {}
    list.forEach((u) => {
      const id = u.id ?? u._id
      if (!id) return
      next[id] = { role: u.role || 'user', status: u.status || 'active' }
    })
    setPendingEdits(next)
  }, [])

  useEffect(() => {
    if (rows.length) initEditsForRows(rows)
  }, [rows, initEditsForRows])

  const totalPages = pagination?.totalPages ?? 1

  const handleFieldChange = useCallback((id, field, value) => {
    setPendingEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }))
  }, [])

  const handleSaveRow = useCallback(
    async (row) => {
      const id = row.id ?? row._id
      if (!id) return
      const draft = pendingEdits[id]
      if (!draft) return
      setSavingId(id)
      try {
        if (draft.role !== row.role) {
          await adminService.updateUserRole(id, draft.role)
        }
        if (draft.status !== row.status) {
          await adminService.updateUserStatus(id, draft.status)
        }
        await load()
      } catch {
        setError(t('adminConsole.loadError'))
      } finally {
        setSavingId(null)
      }
    },
    [pendingEdits, load, t]
  )

  const isDirty = useCallback(
    (row) => {
      const id = row.id ?? row._id
      const d = pendingEdits[id]
      if (!d) return false
      return d.role !== row.role || d.status !== row.status
    },
    [pendingEdits]
  )

  const title = useMemo(() => t('adminConsole.usersTitle'), [t])

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h1>
      <p className="text-sm text-gray-500 mb-6">{t('staffDashboard.adminConsoleSubtitle')}</p>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('adminConsole.searchPlaceholder')}
          className="flex-1 min-w-[200px] bg-card-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={`${selectClass} sm:max-w-[160px]`}
        >
          <option value="">{t('adminConsole.filterRoleAll')}</option>
          <option value="user">{t('adminConsole.roleUser')}</option>
          <option value="moderator">{t('adminConsole.roleModerator')}</option>
          <option value="admin">{t('adminConsole.roleAdmin')}</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${selectClass} sm:max-w-[160px]`}
        >
          <option value="">{t('adminConsole.filterStatusAll')}</option>
          <option value="active">{t('adminConsole.statusActive')}</option>
          <option value="inactive">{t('adminConsole.statusInactive')}</option>
          <option value="banned">{t('adminConsole.statusBanned')}</option>
          <option value="pending">{t('adminConsole.statusPending')}</option>
        </select>
      </div>

      {error ? <p className="text-red-400 text-sm mb-4">{error}</p> : null}

      <div className="rounded-2xl border border-border-dark bg-card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[720px]">
            <thead className="bg-black/25 text-gray-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('adminConsole.colName')}</th>
                <th className="px-4 py-3 font-semibold">{t('adminConsole.colEmail')}</th>
                <th className="px-4 py-3 font-semibold">{t('adminConsole.colRole')}</th>
                <th className="px-4 py-3 font-semibold">{t('adminConsole.colStatus')}</th>
                <th className="px-4 py-3 font-semibold text-right">{t('adminConsole.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    <span className="material-symbols-outlined animate-spin align-middle mr-2">progress_activity</span>
                    {t('common.loading')}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    {t('adminConsole.noData')}
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const id = row.id ?? row._id
                  const draft = pendingEdits[id] || { role: row.role, status: row.status }
                  const self = myId != null && String(id) === String(myId)
                  return (
                    <tr key={id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white font-medium">{row.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 max-w-[200px] truncate" title={row.email}>
                        {row.email || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={draft.role}
                          disabled={self}
                          onChange={(e) => handleFieldChange(id, 'role', e.target.value)}
                          className={selectClass}
                        >
                          <option value="user">{t('adminConsole.roleUser')}</option>
                          <option value="moderator">{t('adminConsole.roleModerator')}</option>
                          <option value="admin">{t('adminConsole.roleAdmin')}</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={draft.status}
                          disabled={self}
                          onChange={(e) => handleFieldChange(id, 'status', e.target.value)}
                          className={selectClass}
                        >
                          <option value="active">{t('adminConsole.statusActive')}</option>
                          <option value="inactive">{t('adminConsole.statusInactive')}</option>
                          <option value="banned">{t('adminConsole.statusBanned')}</option>
                          <option value="pending">{t('adminConsole.statusPending')}</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailUserId(id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border-dark text-gray-200 hover:bg-white/10 text-xs font-semibold px-3 py-1.5"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                            {t('adminConsole.viewDetail')}
                          </button>
                          <button
                            type="button"
                            disabled={!isDirty(row) || savingId === id || self}
                            onClick={() => handleSaveRow(row)}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary/90 hover:bg-primary disabled:opacity-40 disabled:pointer-events-none text-background-dark text-xs font-bold px-3 py-1.5"
                          >
                            {savingId === id ? (
                              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                            ) : null}
                            {t('adminConsole.save')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-xl border border-border-dark text-sm text-gray-300 hover:bg-white/5 disabled:opacity-40"
          >
            {t('adminConsole.prev')}
          </button>
          <span className="text-sm text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 rounded-xl border border-border-dark text-sm text-gray-300 hover:bg-white/5 disabled:opacity-40"
          >
            {t('adminConsole.next')}
          </button>
        </div>
      ) : null}

      <AdminUserDetailModal
        open={Boolean(detailUserId)}
        userId={detailUserId}
        currentUserId={myId}
        onClose={() => setDetailUserId(null)}
        onMutate={load}
      />
    </div>
  )
}
