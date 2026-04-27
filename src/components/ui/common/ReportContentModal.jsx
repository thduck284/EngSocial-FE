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

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => !loading && onClose?.()}
      role="presentation"
    >
      <form
        className="bg-[#1e2630] rounded-2xl shadow-2xl w-full max-w-md p-6 border border-white/5"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className="text-white text-lg font-bold mb-4">{title}</h3>
        <label className="block text-sm text-gray-400 mb-1.5">{t('report.reasonLabel')}</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full mb-4 rounded-xl bg-background-dark border border-border-dark text-white text-sm px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {REASON_OPTIONS.map(({ value, labelKey }) => (
            <option key={value} value={value}>
              {t(labelKey)}
            </option>
          ))}
        </select>
        <label className="block text-sm text-gray-400 mb-1.5">{t('report.detailsLabel')}</label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder={t('report.detailsPlaceholder')}
          className="w-full mb-4 rounded-xl bg-background-dark border border-border-dark text-white text-sm px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-gray-500"
        />
        {error ? <p className="text-red-400 text-sm mb-3">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => !loading && onClose?.()}
            className="px-4 py-2 rounded-xl bg-transparent border border-white/20 text-white hover:bg-white/5 text-sm font-medium disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> : null}
            {t('report.submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
