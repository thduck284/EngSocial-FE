export function AlertModal({
  open,
  title,
  message,
  confirmText = 'OK',
  cancelText = '',
  onClose,
  onConfirm,
}) {
  if (!open) return null

  const handleConfirm = () => {
    if (typeof onConfirm === 'function') {
      onConfirm()
      return
    }
    onClose?.()
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-card-dark rounded-3xl shadow-2xl w-full max-w-md p-8 border border-slate-200 dark:border-border-dark animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="text-slate-900 dark:text-white text-xl font-black mb-3 tracking-tight">{title}</h3>}
        <p className="text-slate-500 dark:text-gray-400 text-sm mb-8 leading-relaxed font-medium">{message}</p>
        <div className="flex justify-end gap-3">
          {cancelText ? (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-black uppercase tracking-widest transition-all"
            >
              {cancelText}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleConfirm}
            className="px-8 py-2.5 rounded-xl bg-primary text-white hover:brightness-110 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/25 transition-all active:scale-95"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

