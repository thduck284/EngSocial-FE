import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const REASON_OPTIONS = [
  { value: 'spam', labelKey: 'report.reasonSpam' },
  { value: 'harassment', labelKey: 'report.reasonHarassment' },
  { value: 'hate', labelKey: 'report.reasonHate' },
  { value: 'violence', labelKey: 'report.reasonViolence' },
  { value: 'sexual', labelKey: 'report.reasonSexual' },
  { value: 'misinformation', labelKey: 'report.reasonMisinformation' },
  { value: 'other', labelKey: 'report.reasonOther' },
]

/**
 * @param {{ open: boolean, titleKey: string, onClose: () => void, onSubmit: (payload: { reason: string, details: string }) => Promise<void> }} props
 */
export function ReportContentModal({ open, titleKey, onClose, onSubmit }) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('spam')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const title = useMemo(() => (titleKey ? t(titleKey) : t('report.titleUser')), [titleKey, t])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason || loading || typeof onSubmit !== 'function') return
    setError('')
    setLoading(true)
    try {
      await onSubmit({ reason, details: details.trim() })
      onClose?.()
      setDetails('')
      setReason('spam')
    } catch (err) {
      setError(err?.message || err?.data?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const fieldClass =
    'w-full rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-slate-900 dark:text-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => !loading && onClose?.()}
      role="presentation"
    >
      <form
        className="bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-border-dark"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4">{title}</h3>
        <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1.5">
          {t('report.reasonLabel')}
        </label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} className={`${fieldClass} mb-4`}>
          {REASON_OPTIONS.map(({ value, labelKey }) => (
            <option key={value} value={value}>
              {t(labelKey)}
            </option>
          ))}
        </select>
        <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1.5">
          {t('report.detailsLabel')}
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder={t('report.detailsPlaceholder')}
          className={`${fieldClass} mb-4 resize-none placeholder:text-slate-400 dark:placeholder:text-gray-500`}
        />
        {error ? <p className="text-red-600 dark:text-red-400 text-sm mb-3">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => !loading && onClose?.()}
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 text-sm font-medium disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> : null}
            {t('report.submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
