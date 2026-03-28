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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1e2630] rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="text-white text-base font-bold mb-2">{title}</h3>}
        <p className="text-gray-200 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          {cancelText ? (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-transparent border border-white/20 text-white hover:bg-white/5 text-sm font-medium"
            >
              {cancelText}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 text-sm font-medium"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
