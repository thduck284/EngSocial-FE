import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../services'
import { getReportEmailPresets, HELP_URL } from '../../utils/adminReportEmailPresets'
import {
  AdminStatusDurationPicker,
  buildStatusDurationPayload,
  formatAdminStatusUntil,
} from './AdminStatusDurationPicker'

const textareaClass =
  'w-full min-h-[140px] rounded-xl border border-border-dark bg-background-dark px-3 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:ring-1 focus:ring-primary resize-y'

const selectClass =
  'w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-primary'

const actionBtnClass =
  'px-3 py-2 rounded-lg text-xs font-semibold border disabled:opacity-40 disabled:cursor-not-allowed'

function statusLabel(t, status) {
  if (status === 'active') return t('adminConsole.statusActive')
  if (status === 'inactive') return t('adminConsole.statusInactive')
  if (status === 'banned') return t('adminConsole.statusBanned')
  if (status === 'pending') return t('adminConsole.statusPending')
  return status || '—'
}

export function AdminReportStatusEmailModal({ open, reportId, newStatus, onClose, onSuccess }) {
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [accountLoading, setAccountLoading] = useState(false)
  const [error, setError] = useState('')
  const [accountNotice, setAccountNotice] = useState('')
  const [report, setReport] = useState(null)
  const [reportedAccountStatus, setReportedAccountStatus] = useState(null)
  const [reportedAccountStatusUntil, setReportedAccountStatusUntil] = useState(null)
  const [lockDurationMode, setLockDurationMode] = useState('timed')
  const [lockDurationValue, setLockDurationValue] = useState('7')
  const [lockDurationUnit, setLockDurationUnit] = useState('day')
  const [reporterPreset, setReporterPreset] = useState('custom')
  const [reportedPreset, setReportedPreset] = useState('custom')
  const [reporterMessage, setReporterMessage] = useState('')
  const [reportedUserMessage, setReportedUserMessage] = useState('')

  const targetType = report?.targetType || 'post'
  const presetVars = useMemo(
    () => ({ reason: report?.reason || '' }),
    [report?.reason],
  )
  const presets = useMemo(
    () => getReportEmailPresets(i18n.language, newStatus, targetType, presetVars),
    [i18n.language, newStatus, targetType, presetVars],
  )

  const reportedUser = report?.reportedUser || report?.targetPreview?.author || null
  const reportedUserId = reportedUser?.id || null
  const reportedEmail = reportedUser?.email || ''
  const reporterEmail = report?.reporter?.email || ''

  const applyPresetDefaults = useCallback(
    (data) => {
      const p = getReportEmailPresets(
        i18n.language,
        newStatus,
        data?.targetType || 'post',
        { reason: data?.reason || '' },
      )
      setReporterPreset(p.reporter[0]?.id || 'custom')
      setReportedPreset(p.reported[0]?.id || 'custom')
      setReporterMessage(p.reporter[0]?.text || '')
      setReportedUserMessage(p.reported[0]?.text || '')
    },
    [i18n.language, newStatus],
  )

  const loadReportedAccountStatus = useCallback(
    async (userId) => {
      if (!userId) {
        setReportedAccountStatus(null)
        setReportedAccountStatusUntil(null)
        return
      }
      try {
        const res = await adminService.getUserById(userId)
        const u = res?.data?.user ?? res?.data ?? null
        setReportedAccountStatus(u?.status || null)
        setReportedAccountStatusUntil(u?.statusUntil || null)
      } catch {
        setReportedAccountStatus(null)
      }
    },
    [],
  )

  const load = useCallback(() => {
    if (!reportId) return
    setError('')
    setAccountNotice('')
    setLoading(true)
    adminService
      .getReportById(reportId)
      .then(async (res) => {
        const data = res?.data ?? null
        setReport(data)
        applyPresetDefaults(data)
        const uid = data?.reportedUser?.id || data?.targetPreview?.author?.id
        await loadReportedAccountStatus(uid)
      })
      .catch(() => {
        setReport(null)
        setError(t('adminConsole.reportTargetLoadError'))
      })
      .finally(() => setLoading(false))
  }, [reportId, t, applyPresetDefaults, loadReportedAccountStatus])

  useEffect(() => {
    if (!open || !reportId) return
    load()
  }, [open, reportId, load])

  const applyReporterPreset = (presetId) => {
    setReporterPreset(presetId)
    if (presetId === 'custom') return
    const item = presets.reporter.find((p) => p.id === presetId)
    if (item) setReporterMessage(item.text)
  }

  const applyReportedPreset = (presetId) => {
    setReportedPreset(presetId)
    if (presetId === 'custom') return
    const item = presets.reported.find((p) => p.id === presetId)
    if (item) setReportedUserMessage(item.text)
  }

  const handleAccountStatus = async (status) => {
    if (!reportedUserId) return
    setAccountLoading(true)
    setAccountNotice('')
    setError('')
    try {
      const duration =
        status === 'active' ? undefined : buildStatusDurationPayload(lockDurationMode, lockDurationValue, lockDurationUnit)
      const res = await adminService.updateUserStatus(reportedUserId, status, duration)
      const updated = res?.data?.user || res?.data || {}
      setReportedAccountStatus(updated.status || status)
      setReportedAccountStatusUntil(updated.statusUntil || null)
      setAccountNotice(t('adminConsole.reportEmailAccountUpdated', { status: statusLabel(t, updated.status || status) }))
    } catch {
      setError(t('adminConsole.reportEmailAccountFailed'))
    } finally {
      setAccountLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!reportId || !newStatus) return
    if (!reporterMessage.trim()) {
      setError(t('adminConsole.reportEmailReporterRequired'))
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await adminService.updateReportStatus(reportId, {
        status: newStatus,
        reporterMessage: reporterMessage.trim(),
        reportedUserMessage: newStatus === 'reviewed' ? reportedUserMessage.trim() || undefined : undefined,
      })
      onSuccess?.()
      onClose?.()
    } catch (err) {
      const apiMsg =
        err?.data?.errors?.[0]?.message ||
        err?.data?.message ||
        err?.message
      setError(apiMsg || t('adminConsole.reportEmailSendFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const statusText =
    newStatus === 'reviewed' ? t('adminConsole.reportReviewed') : t('adminConsole.reportDismissed')
  const targetTypeLabel = t(`adminConsole.reportTargetTypeLabel.${targetType}`, targetType)

  return (
    <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border-dark bg-card-dark shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b border-border-dark bg-card-dark/95 backdrop-blur-sm">
          <div>
            <h2 className="text-lg font-bold text-white">{t('adminConsole.reportEmailModalTitle')}</h2>
            <p className="text-xs text-gray-500 mt-1">
              {t('adminConsole.reportEmailModalSubtitle', { status: statusText })}
            </p>
            <p className="text-[11px] text-primary/90 mt-1 font-medium">
              {t('adminConsole.reportEmailTargetTypeHint', { type: targetTypeLabel })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting || accountLoading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-40"
            aria-label={t('common.close')}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-8">
              <span className="material-symbols-outlined animate-spin align-middle mr-2">progress_activity</span>
              {t('common.loading')}
            </p>
          ) : error && !report ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : (
            <>
              <section className="rounded-xl border border-border-dark bg-black/20 p-4 space-y-3">
                <h3 className="text-sm font-bold text-white">{t('adminConsole.reportEmailReporterSection')}</h3>
                <div className="text-xs text-gray-400">
                  <span className="text-gray-500">{t('adminConsole.colEmail')}:</span>{' '}
                  <span className="text-gray-200">{reporterEmail || '—'}</span>
                </div>
                {report?.reporter?.name ? (
                  <div className="text-xs text-gray-400">
                    <span className="text-gray-500">{t('adminConsole.colName')}:</span>{' '}
                    <span className="text-gray-200">{report.reporter.name}</span>
                  </div>
                ) : null}
                {report?.reason ? (
                  <div className="text-xs text-gray-500">
                    <span className="text-gray-600">{t('adminConsole.colReason')}:</span> {report.reason}
                  </div>
                ) : null}
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('adminConsole.reportEmailPresetLabel')}
                </label>
                <select
                  value={reporterPreset}
                  onChange={(e) => applyReporterPreset(e.target.value)}
                  className={selectClass}
                  disabled={submitting || accountLoading}
                >
                  {presets.reporter.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                  <option value="custom">{t('adminConsole.reportEmailPresetCustom')}</option>
                </select>
                <textarea
                  value={reporterMessage}
                  onChange={(e) => {
                    setReporterPreset('custom')
                    setReporterMessage(e.target.value)
                  }}
                  className={textareaClass}
                  disabled={submitting || accountLoading}
                  placeholder={t('adminConsole.reportEmailMessagePlaceholder')}
                />
              </section>

              {newStatus === 'reviewed' ? (
              <section className="rounded-xl border border-border-dark bg-black/20 p-4 space-y-3">
                <h3 className="text-sm font-bold text-white">{t('adminConsole.reportEmailReportedSection')}</h3>
                {reportedEmail ? (
                  <>
                    <div className="text-xs text-gray-400">
                      <span className="text-gray-500">{t('adminConsole.colEmail')}:</span>{' '}
                      <span className="text-gray-200">{reportedEmail}</span>
                    </div>
                    {reportedUser?.name ? (
                      <div className="text-xs text-gray-400">
                        <span className="text-gray-500">{t('adminConsole.colName')}:</span>{' '}
                        <span className="text-gray-200">{reportedUser.name}</span>
                      </div>
                    ) : null}
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t('adminConsole.reportEmailPresetLabel')}
                    </label>
                    <select
                      value={reportedPreset}
                      onChange={(e) => applyReportedPreset(e.target.value)}
                      className={selectClass}
                      disabled={submitting || accountLoading}
                    >
                      {presets.reported.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                      <option value="custom">{t('adminConsole.reportEmailPresetCustom')}</option>
                    </select>
                    <textarea
                      value={reportedUserMessage}
                      onChange={(e) => {
                        setReportedPreset('custom')
                        setReportedUserMessage(e.target.value)
                      }}
                      className={textareaClass}
                      disabled={submitting || accountLoading}
                      placeholder={t('adminConsole.reportEmailMessagePlaceholder')}
                    />
                  </>
                ) : (
                  <p className="text-sm text-amber-500/90">{t('adminConsole.reportEmailNoReportedEmail')}</p>
                )}
              </section>
              ) : (
                <p className="text-sm text-gray-500 rounded-xl border border-border-dark bg-black/15 px-4 py-3">
                  {t('adminConsole.reportEmailDismissedSkipReported')}
                </p>
              )}

              {reportedUserId ? (
                <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                  <h3 className="text-sm font-bold text-white">{t('adminConsole.reportEmailAccountSection')}</h3>
                  <p className="text-xs text-gray-400">
                    {t('adminConsole.reportEmailAccountStatus', {
                      status: statusLabel(t, reportedAccountStatus || 'active'),
                    })}
                  </p>
                  {reportedAccountStatus === 'banned' || reportedAccountStatus === 'inactive' ? (
                    <p className="text-[11px] text-gray-500">
                      {reportedAccountStatusUntil
                        ? t('adminConsole.reportEmailAccountUntil', {
                            date: formatAdminStatusUntil(reportedAccountStatusUntil, i18n.language),
                          })
                        : t('adminConsole.reportEmailAccountPermanent')}
                    </p>
                  ) : null}
                  <AdminStatusDurationPicker
                    mode={lockDurationMode}
                    durationValue={lockDurationValue}
                    durationUnit={lockDurationUnit}
                    onModeChange={setLockDurationMode}
                    onValueChange={setLockDurationValue}
                    onUnitChange={setLockDurationUnit}
                    disabled={accountLoading || submitting}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={accountLoading || submitting || reportedAccountStatus === 'banned'}
                      onClick={() => handleAccountStatus('banned')}
                      className={`${actionBtnClass} border-red-500/40 text-red-300 hover:bg-red-500/10`}
                    >
                      {t('adminConsole.lockAccount')}
                    </button>
                    <button
                      type="button"
                      disabled={accountLoading || submitting || reportedAccountStatus === 'inactive'}
                      onClick={() => handleAccountStatus('inactive')}
                      className={`${actionBtnClass} border-amber-500/40 text-amber-200 hover:bg-amber-500/10`}
                    >
                      {t('adminConsole.reportEmailSuspendAccount')}
                    </button>
                    <button
                      type="button"
                      disabled={
                        accountLoading ||
                        submitting ||
                        reportedAccountStatus === 'active' ||
                        !reportedAccountStatus
                      }
                      onClick={() => handleAccountStatus('active')}
                      className={`${actionBtnClass} border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10`}
                    >
                      {t('adminConsole.unlockAccount')}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500">{t('adminConsole.reportEmailAccountHint')}</p>
                  {accountNotice ? <p className="text-xs text-emerald-400">{accountNotice}</p> : null}
                </section>
              ) : null}

              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-gray-300">
                <p className="font-semibold text-primary mb-1">{t('adminConsole.reportEmailHelpNote')}</p>
                <a
                  href={HELP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {HELP_URL}
                </a>
              </div>

              {error ? <p className="text-sm text-red-400">{error}</p> : null}

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting || accountLoading}
                  className="px-4 py-2.5 rounded-xl border border-border-dark text-sm text-gray-300 hover:bg-white/5 disabled:opacity-40"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || loading || accountLoading || !reporterEmail}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 disabled:opacity-40"
                >
                  {submitting ? t('adminConsole.reportEmailSending') : t('adminConsole.reportEmailSend')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
