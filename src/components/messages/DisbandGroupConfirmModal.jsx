export function DisbandGroupConfirmModal({ t, open, onClose, onConfirm }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-sm p-6 border border-slate-200 dark:border-border-dark" onClick={(e) => e.stopPropagation()}>
        <p className="text-slate-800 dark:text-white text-sm mb-6">{t('messages.disbandGroupConfirm')}</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 text-sm font-medium">
            {t('common.cancel')}
          </button>
          <button type="button" onClick={() => { onConfirm(); onClose() }} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 text-sm font-medium">
            {t('messages.disbandGroup')}
          </button>
        </div>
      </div>
    </div>
  )
}
