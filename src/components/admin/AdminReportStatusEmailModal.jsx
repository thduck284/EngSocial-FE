import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../services'

const HELP_URL = 'https://engsocial-fe.onrender.com/help'

const textareaClass =
  'w-full min-h-[120px] rounded-xl border border-border-dark bg-background-dark px-3 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:ring-1 focus:ring-primary resize-y'

const selectClass =
  'w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-primary'

function buildPresets(t, status, targetType) {
  const typeLabel = targetType || 'content'
  if (status === 'reviewed') {
    return {
      reporter: [
        {
          id: 'reviewed_reporter_1',
          label: t('adminConsole.reportEmailPresetReporterReviewed1'),
          text: t('adminConsole.reportEmailPresetReporterReviewed1Body', { targetType: typeLabel }),
        },
        {
          id: 'reviewed_reporter_2',
          label: t('adminConsole.reportEmailPresetReporterReviewed2'),
          text: t('adminConsole.reportEmailPresetReporterReviewed2Body', { targetType: typeLabel }),
        },
      ],
      reported: [
        {
          id: 'reviewed_reported_1',
          label: t('adminConsole.reportEmailPresetReportedReviewed1'),
          text: t('adminConsole.reportEmailPresetReportedReviewed1Body', { targetType: typeLabel }),
        },
        {
          id: 'reviewed_reported_2',
          label: t('adminConsole.reportEmailPresetReportedReviewed2'),
          text: t('adminConsole.reportEmailPresetReportedReviewed2Body', { targetType: typeLabel }),
        },
      ],
    }
  }

  return {
    reporter: [
      {
        id: 'dismissed_reporter_1',
        label: t('adminConsole.reportEmailPresetReporterDismissed1'),
        text: t('adminConsole.reportEmailPresetReporterDismissed1Body', { targetType: typeLabel }),
      },
      {
        id: 'dismissed_reporter_2',
        label: t('adminConsole.reportEmailPresetReporterDismissed2'),
        text: t('adminConsole.reportEmailPresetReporterDismissed2Body', { targetType: typeLabel }),
      },
    ],
    reported: [
      {
        id: 'dismissed_reported_1',
        label: t('adminConsole.reportEmailPresetReportedDismissed1'),
        text: t('adminConsole.reportEmailPresetReportedDismissed1Body', { targetType: typeLabel, helpUrl: HELP_URL }),
      },
      {
        id: 'dismissed_reported_2',
        label: t('adminConsole.reportEmailPresetReportedDismissed2'),
        text: t('adminConsole.reportEmailPresetReportedDismissed2Body', { targetType: typeLabel, helpUrl: HELP_URL }),
      },
    ],
  }
}

export function AdminReportStatusEmailModal({ open, reportId, newStatus, onClose, onSuccess }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState(null)
  const [reporterPreset, setReporterPreset] = useState('custom')
  const [reportedPreset, setReportedPreset] = useState('custom')
  const [reporterMessage, setReporterMessage] = useState('')
  const [reportedUserMessage, setReportedUserMessage] = useState('')

  const targetType = report?.targetType || 'post'
  const presets = useMemo(() => buildPresets(t, newStatus, targetType), [t, newStatus, targetType])

  const reportedUser = report?.reportedUser || report?.targetPreview?.author || null
  const reportedEmail = reportedUser?.email || ''
  const reporterEmail = report?.reporter?.email || ''

  const load = useCallback(() => {
    if (!reportId) return
    setError('')
    setLoading(true)
    adminService
      .getReportById(reportId)
      .then((res) => {
        const data = res?.data ?? null
        setReport(data)
        const p = buildPresets(t, newStatus, data?.targetType || 'post')
        const reporterDefault = p.reporter[0]?.text || ''
        const reportedDefault = p.reported[0]?.text || ''
        setReporterPreset(p.reporter[0]?.id || 'custom')
        setReportedPreset(p.reported[0]?.id || 'custom')
        setReporterMessage(reporterDefault)
        setReportedUserMessage(reportedDefault)
      })
      .catch(() => {
        setReport(null)
        setError(t('adminConsole.reportTargetLoadError'))
      })
      .finally(() => setLoading(false))
  }, [reportId, newStatus, t])

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
        reportedUserMessage: reportedUserMessage.trim() || undefined,
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

  const statusLabel =
    newStatus === 'reviewed' ? t('adminConsole.reportReviewed') : t('adminConsole.reportDismissed')

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
              {t('adminConsole.reportEmailModalSubtitle', { status: statusLabel })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
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
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('adminConsole.reportEmailPresetLabel')}
                </label>
                <select
                  value={reporterPreset}
                  onChange={(e) => applyReporterPreset(e.target.value)}
                  className={selectClass}
                  disabled={submitting}
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
                  disabled={submitting}
                  placeholder={t('adminConsole.reportEmailMessagePlaceholder')}
                />
              </section>

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
                      disabled={submitting}
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
                      disabled={submitting}
                      placeholder={t('adminConsole.reportEmailMessagePlaceholder')}
                    />
                  </>
                ) : (
                  <p className="text-sm text-amber-500/90">{t('adminConsole.reportEmailNoReportedEmail')}</p>
                )}
              </section>

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
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-border-dark text-sm text-gray-300 hover:bg-white/5 disabled:opacity-40"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || loading || !reporterEmail}
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
