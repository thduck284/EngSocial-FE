import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { adminService } from '../services'
import { AdminReportTargetModal } from '../components/admin/AdminReportTargetModal'
import { AdminReportStatusEmailModal } from '../components/admin/AdminReportStatusEmailModal'

const PAGE_SIZE = 20

const selectClass =
  'bg-background-dark border border-border-dark rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-primary'

const inputClass =
  'bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-primary'

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

function toDateInputValue(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getPresetRange(preset) {
  const now = new Date()
  const today = toDateInputValue(now)
  if (!preset || preset === 'all') return { from: '', to: '' }
  if (preset === 'today') return { from: today, to: today }
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : preset === '90d' ? 90 : null
  if (days != null) {
    const from = new Date(now)
    from.setDate(from.getDate() - days)
    return { from: toDateInputValue(from), to: today }
  }
  return { from: '', to: '' }
}

const TARGET_TYPES = ['post', 'message', 'conversation', 'user']

export function AdminReportsPage() {
  const { t, i18n } = useTranslation()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [targetTypeFilter, setTargetTypeFilter] = useState('')
  const [datePreset, setDatePreset] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [viewReportId, setViewReportId] = useState(null)
  const [emailModal, setEmailModal] = useState(null)

  useEffect(() => {
    const tmr = setTimeout(() => setSearchDebounced(search.trim()), 400)
    return () => clearTimeout(tmr)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [searchDebounced, statusFilter, targetTypeFilter, dateFrom, dateTo])

  const handleDatePresetChange = useCallback((preset) => {
    setDatePreset(preset)
    if (preset === 'custom') return
    const { from, to } = getPresetRange(preset)
    setDateFrom(from)
    setDateTo(to)
  }, [])

  const handleDateFromChange = useCallback((value) => {
    setDateFrom(value)
    setDatePreset('custom')
  }, [])

  const handleDateToChange = useCallback((value) => {
    setDateTo(value)
    setDatePreset('custom')
  }, [])

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        searchDebounced ||
          statusFilter ||
          targetTypeFilter ||
          dateFrom ||
          dateTo ||
          (datePreset && datePreset !== 'all'),
      ),
    [searchDebounced, statusFilter, targetTypeFilter, dateFrom, dateTo, datePreset],
  )

  const clearFilters = useCallback(() => {
    setSearch('')
    setSearchDebounced('')
    setStatusFilter('')
    setTargetTypeFilter('')
    setDatePreset('all')
    setDateFrom('')
    setDateTo('')
  }, [])

  const load = useCallback(() => {
    setError('')
    setLoading(true)
    adminService
      .getReports({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
        targetType: targetTypeFilter || undefined,
        search: searchDebounced || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
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
  }, [page, statusFilter, targetTypeFilter, searchDebounced, dateFrom, dateTo, t])

  useEffect(() => {
    load()
  }, [load])

  const totalPages = pagination?.totalPages ?? 1

  const handleStatusChange = useCallback(
    async (reportId, status, emailPayload = null) => {
      setUpdatingId(reportId)
      try {
        if (emailPayload) {
          await adminService.updateReportStatus(reportId, emailPayload)
        } else {
          await adminService.updateReportStatus(reportId, { status })
        }
        await load()
      } catch {
        setError(t('adminConsole.loadError'))
      } finally {
        setUpdatingId(null)
      }
    },
    [load, t],
  )

  const handleStatusSelect = useCallback(
    (report, newStatus) => {
      if (newStatus === report.status) return
      if (newStatus === 'reviewed' || newStatus === 'dismissed') {
        setEmailModal({ reportId: report.id, newStatus })
        return
      }
      handleStatusChange(report.id, newStatus)
    },
    [handleStatusChange],
  )

  const title = useMemo(() => t('adminConsole.reportsTitle'), [t])

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h1>
      <p className="text-sm text-gray-500 mb-6">{t('staffDashboard.adminConsoleSubtitle')}</p>

      <div className="space-y-3 mb-6">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('adminConsole.reportsSearchPlaceholder')}
            className={`${inputClass} flex-1 min-w-[200px]`}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${selectClass} sm:w-44 py-2`}
          >
            <option value="">{t('adminConsole.filterReportStatusAll')}</option>
            <option value="pending">{t('adminConsole.reportPending')}</option>
            <option value="reviewed">{t('adminConsole.reportReviewed')}</option>
            <option value="dismissed">{t('adminConsole.reportDismissed')}</option>
          </select>
          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className={`${selectClass} sm:w-48 py-2`}
          >
            <option value="">{t('adminConsole.filterTargetTypeAll')}</option>
            {TARGET_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`adminConsole.reportTargetTypeLabel.${type}`, type)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              {t('adminConsole.reportsDatePreset')}
            </label>
            <select
              value={datePreset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
              className={`${selectClass} py-2 w-full sm:w-48`}
            >
              <option value="all">{t('adminConsole.reportsDatePresetAll')}</option>
              <option value="today">{t('adminConsole.reportsDatePresetToday')}</option>
              <option value="7d">{t('adminConsole.reportsDatePreset7d')}</option>
              <option value="30d">{t('adminConsole.reportsDatePreset30d')}</option>
              <option value="90d">{t('adminConsole.reportsDatePreset90d')}</option>
              <option value="custom">{t('adminConsole.reportsDatePresetCustom')}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              {t('adminConsole.reportsDateFrom')}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleDateFromChange(e.target.value)}
              className={`${inputClass} py-1.5 text-xs`}
            />
          </div>
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              {t('adminConsole.reportsDateTo')}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleDateToChange(e.target.value)}
              min={dateFrom || undefined}
              className={`${inputClass} py-1.5 text-xs`}
            />
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-2 rounded-lg border border-border-dark text-xs text-gray-400 hover:text-white hover:bg-white/5"
            >
              {t('adminConsole.reportsClearFilters')}
            </button>
          ) : null}
        </div>

        {pagination?.total != null ? (
          <p className="text-xs text-gray-500">
            {t('adminConsole.reportsResultCount', { count: pagination.total })}
          </p>
        ) : null}
      </div>

      {error ? <p className="text-red-400 text-sm mb-4">{error}</p> : null}

      <div className="rounded-2xl border border-border-dark bg-card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[980px]">
            <thead className="bg-black/25 text-gray-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">{t('adminConsole.colDate')}</th>
                <th className="px-3 py-3 font-semibold">{t('adminConsole.colReporter')}</th>
                <th className="px-3 py-3 font-semibold">{t('adminConsole.colTargetType')}</th>
                <th className="px-3 py-3 font-semibold min-w-[180px]">{t('adminConsole.colTargetContent')}</th>
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
                    <td className="px-3 py-3 text-primary text-xs font-mono">
                      {t(`adminConsole.reportTargetTypeLabel.${r.targetType}`, r.targetType)}
                    </td>
                    <td className="px-3 py-3 text-xs max-w-[220px]">
                      {r.targetPreview?.found ? (
                        <div className="space-y-1.5">
                          {r.targetPreview.label ? (
                            <div className="font-medium text-white truncate" title={r.targetPreview.label}>
                              {r.targetPreview.label}
                            </div>
                          ) : null}
                          {r.targetPreview.excerpt ? (
                            <div className="text-gray-400 line-clamp-2 break-words" title={r.targetPreview.excerpt}>
                              {r.targetPreview.excerpt}
                            </div>
                          ) : (
                            <div className="text-gray-500 italic">{t('adminConsole.reportTargetNoText')}</div>
                          )}
                          {r.targetPreview.unavailable ? (
                            <span className="inline-block text-[10px] text-red-400">{t('adminConsole.reportTargetUnavailable')}</span>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setViewReportId(r.id)}
                            className="inline-flex items-center gap-1 text-primary hover:underline text-[11px] font-semibold"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            {t('adminConsole.reportViewTarget')}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-red-400 text-[11px]">{t('adminConsole.reportTargetNotFound')}</span>
                          <div className="text-gray-500 font-mono text-[10px] break-all">{r.targetId}</div>
                          <button
                            type="button"
                            onClick={() => setViewReportId(r.id)}
                            className="text-primary hover:underline text-[11px] font-semibold"
                          >
                            {t('adminConsole.reportViewTarget')}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-300 text-xs max-w-[140px] break-words">{r.reason}</td>
                    <td className="px-3 py-3 text-gray-500 text-xs max-w-[180px] break-words">{r.details || '—'}</td>
                    <td className="px-3 py-3">
                      <select
                        value={r.status}
                        disabled={updatingId === r.id}
                        onChange={(e) => handleStatusSelect(r, e.target.value)}
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

      <AdminReportTargetModal
        open={!!viewReportId}
        reportId={viewReportId}
        onClose={() => setViewReportId(null)}
      />

      <AdminReportStatusEmailModal
        open={!!emailModal}
        reportId={emailModal?.reportId}
        newStatus={emailModal?.newStatus}
        onClose={() => setEmailModal(null)}
        onSuccess={load}
      />
    </div>
  )
}
