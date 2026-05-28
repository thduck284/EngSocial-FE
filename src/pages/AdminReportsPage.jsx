import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { adminService } from '../services'

const PAGE_SIZE = 20

const selectClass =
  'bg-background-dark border border-border-dark rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-primary'

function formatDt(iso, locale) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return '—'
  }
}

export function AdminReportsPage() {
  const { t, i18n } = useTranslation()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [targetTypeFilter, setTargetTypeFilter] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    setPage(1)
  }, [statusFilter, targetTypeFilter])

  const load = useCallback(() => {
    setError('')
    setLoading(true)
    adminService
      .getReports({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
        targetType: targetTypeFilter || undefined,
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
  }, [page, statusFilter, targetTypeFilter, t])

  useEffect(() => {
    load()
  }, [load])

  const totalPages = pagination?.totalPages ?? 1

  const handleStatusChange = useCallback(
    async (reportId, status) => {
      setUpdatingId(reportId)
      try {
        await adminService.updateReportStatus(reportId, status)
        await load()
      } catch {
        setError(t('adminConsole.loadError'))
      } finally {
        setUpdatingId(null)
      }
    },
    [load, t]
  )

  const title = useMemo(() => t('adminConsole.reportsTitle'), [t])

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h1>
      <p className="text-sm text-gray-500 mb-6">{t('staffDashboard.adminConsoleSubtitle')}</p>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${selectClass} sm:w-44`}
        >
          <option value="">{t('adminConsole.filterReportStatusAll')}</option>
          <option value="pending">{t('adminConsole.reportPending')}</option>
          <option value="reviewed">{t('adminConsole.reportReviewed')}</option>
          <option value="dismissed">{t('adminConsole.reportDismissed')}</option>
        </select>
        <select
          value={targetTypeFilter}
          onChange={(e) => setTargetTypeFilter(e.target.value)}
          className={`${selectClass} sm:w-48`}
        >
          <option value="">{t('adminConsole.filterTargetTypeAll')}</option>
          <option value="post">post</option>
          <option value="message">message</option>
          <option value="conversation">conversation</option>
          <option value="user">user</option>
        </select>
      </div>

      {error ? <p className="text-red-400 text-sm mb-4">{error}</p> : null}

      <div className="rounded-2xl border border-border-dark bg-card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[900px]">
            <thead className="bg-black/25 text-gray-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">{t('adminConsole.colDate')}</th>
                <th className="px-3 py-3 font-semibold">{t('adminConsole.colReporter')}</th>
                <th className="px-3 py-3 font-semibold">{t('adminConsole.colTargetType')}</th>
                <th className="px-3 py-3 font-semibold">{t('adminConsole.colTargetId')}</th>
                <th className="px-3 py-3 font-semibold max-w-[140px]">{t('adminConsole.colReason')}</th>
                <th className="px-3 py-3 font-semibold max-w-[180px]">{t('adminConsole.colDetails')}</th>
                <th className="px-3 py-3 font-semibold">{t('adminConsole.colReportStatus')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    <span className="material-symbols-outlined animate-spin align-middle mr-2">progress_activity</span>
                    {t('common.loading')}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    {t('adminConsole.noData')}
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] align-top">
                    <td className="px-3 py-3 text-gray-400 whitespace-nowrap text-xs">
                      {formatDt(r.createdAt, i18n.language)}
                    </td>
                    <td className="px-3 py-3 text-gray-300 text-xs">
                      <div className="font-medium text-white">{r.reporter?.name || '—'}</div>
                      <div className="text-gray-500 truncate max-w-[160px]" title={r.reporter?.email}>
                        {r.reporter?.email || ''}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-primary text-xs font-mono">{r.targetType}</td>
                    <td className="px-3 py-3 text-gray-400 text-xs font-mono break-all max-w-[120px]">{r.targetId}</td>
                    <td className="px-3 py-3 text-gray-300 text-xs max-w-[140px] break-words">{r.reason}</td>
                    <td className="px-3 py-3 text-gray-500 text-xs max-w-[180px] break-words">{r.details || '—'}</td>
                    <td className="px-3 py-3">
                      <select
                        value={r.status}
                        disabled={updatingId === r.id}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        className={`${selectClass} min-w-[110px]`}
                      >
                        <option value="pending">{t('adminConsole.reportPending')}</option>
                        <option value="reviewed">{t('adminConsole.reportReviewed')}</option>
                        <option value="dismissed">{t('adminConsole.reportDismissed')}</option>
                      </select>
                    </td>
                  </tr>
                ))
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
    </div>
  )
}
