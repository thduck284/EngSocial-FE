import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../services'

function formatDt(iso, locale) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return '—'
  }
}

export function AdminReportTargetModal({ open, reportId, onClose }) {
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState(null)

  const load = useCallback(() => {
    if (!reportId) return
    setError('')
    setLoading(true)
    adminService
      .getReportById(reportId)
      .then((res) => {
        setReport(res?.data ?? null)
      })
      .catch(() => {
        setReport(null)
        setError(t('adminConsole.reportTargetLoadError'))
      })
      .finally(() => setLoading(false))
  }, [reportId, t])

  useEffect(() => {
    if (!open || !reportId) return
    load()
  }, [open, reportId, load])

  if (!open) return null

  const preview = report?.targetPreview
  const viewPath = preview?.viewPath
  const conversationMessages = preview?.meta?.messages || []
  const showOpenLink =
    viewPath && preview?.found && (report?.targetType === 'post' || report?.targetType === 'user')

  return (
    <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className={`w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-border-dark bg-card-dark shadow-2xl ${
          report?.targetType === 'conversation' ? 'max-w-2xl' : 'max-w-lg'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b border-border-dark bg-card-dark/95 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white">{t('adminConsole.reportTargetTitle')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            aria-label={t('common.close')}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-8">
              <span className="material-symbols-outlined animate-spin align-middle mr-2">progress_activity</span>
              {t('common.loading')}
            </p>
          ) : error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : !report ? (
            <p className="text-sm text-gray-500">{t('adminConsole.noData')}</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary font-mono uppercase">
                  {report.targetType}
                </span>
                {preview?.unavailable ? (
                  <span className="px-2.5 py-1 rounded-full bg-red-500/15 text-red-400">
                    {t('adminConsole.reportTargetUnavailable')}
                  </span>
                ) : null}
                {!preview?.found ? (
                  <span className="px-2.5 py-1 rounded-full bg-red-500/15 text-red-400">
                    {t('adminConsole.reportTargetNotFound')}
                  </span>
                ) : null}
              </div>

              {preview?.author ? (
                <div className="flex items-center gap-3">
                  {preview.author.avatar ? (
                    <img
                      src={preview.author.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover bg-black/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{preview.author.name}</p>
                    {preview.author.email ? (
                      <p className="text-xs text-gray-500 truncate">{preview.author.email}</p>
                    ) : null}
                  </div>
                </div>
              ) : preview?.label ? (
                <p className="font-semibold text-white">{preview.label}</p>
              ) : null}

              {report.targetType === 'conversation' && preview?.meta?.memberCount != null ? (
                <p className="text-sm text-gray-400">
                  {t('adminConsole.reportTargetMembers', { count: preview.meta.memberCount })}
                </p>
              ) : null}

              {report.targetType === 'conversation' ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t('adminConsole.reportTargetGroupMessages')}
                  </p>
                  {conversationMessages.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">{t('adminConsole.reportTargetNoMessages')}</p>
                  ) : (
                    <div className="max-h-[420px] overflow-y-auto custom-scrollbar space-y-2 rounded-xl border border-border-dark bg-black/20 p-3">
                      {conversationMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`rounded-lg border px-3 py-2.5 ${
                            msg.messageType === 'system'
                              ? 'border-border-dark/60 bg-black/10'
                              : 'border-border-dark bg-black/25'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-white truncate">
                              {msg.messageType === 'system'
                                ? t('adminConsole.reportTargetSystemMessage')
                                : msg.sender?.name || t('common.user')}
                            </span>
                            <span className="text-[10px] text-gray-500 shrink-0">{formatDt(msg.createdAt, i18n.language)}</span>
                          </div>
                          {msg.content ? (
                            <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">{msg.content}</p>
                          ) : null}
                          {msg.attachments?.length > 0 ? (
                            <ul className="mt-1.5 space-y-1">
                              {msg.attachments.map((a, i) => (
                                <li key={a.url || i}>
                                  <a
                                    href={a.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline break-all"
                                  >
                                    {a.name || a.url}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          {!msg.content && !msg.attachments?.length ? (
                            <p className="text-xs text-gray-500 italic">{t('adminConsole.reportTargetNoText')}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                  {preview?.meta?.messagesTruncated ? (
                    <p className="text-xs text-amber-500/90">{t('adminConsole.reportTargetMessagesTruncated')}</p>
                  ) : null}
                </div>
              ) : preview?.content ? (
                <div className="rounded-xl border border-border-dark bg-black/20 p-4">
                  <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">{preview.content}</p>
                </div>
              ) : preview?.found && !preview?.unavailable ? (
                <p className="text-sm text-gray-500 italic">{t('adminConsole.reportTargetNoText')}</p>
              ) : null}

              {preview?.images?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {preview.images.map((url, i) => (
                    <a key={url || i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                      <img src={url} alt="" className="w-full h-28 object-cover rounded-lg border border-border-dark" />
                    </a>
                  ))}
                </div>
              ) : null}

              {preview?.attachments?.length > 0 ? (
                <ul className="text-sm text-gray-400 space-y-1">
                  {preview.attachments.map((a, i) => (
                    <li key={a.url || i}>
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {a.name || a.url}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}

              {preview?.createdAt ? (
                <p className="text-xs text-gray-500">
                  {t('adminConsole.reportTargetCreatedAt')}: {formatDt(preview.createdAt, i18n.language)}
                </p>
              ) : null}

              <div className="rounded-xl border border-border-dark bg-black/15 p-3 text-xs text-gray-400 space-y-1">
                <p>
                  <span className="text-gray-500">{t('adminConsole.colReason')}:</span> {report.reason}
                </p>
                {report.details ? (
                  <p>
                    <span className="text-gray-500">{t('adminConsole.colDetails')}:</span> {report.details}
                  </p>
                ) : null}
                <p className="font-mono break-all text-gray-500">ID: {report.targetId}</p>
              </div>

              {showOpenLink ? (
                <Link
                  to={viewPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110"
                >
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                  {t('adminConsole.reportTargetOpen')}
                </Link>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
