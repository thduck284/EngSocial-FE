import { useEffect, useState } from 'react'

export function LeaveGroupConfirmModal({
  t,
  open,
  onClose,
  onConfirm,
  messageKey = 'messages.leaveGroupConfirm',
  confirmKey = 'messages.leaveGroup',
}) {
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (!open) setBusy(false)
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={busy ? undefined : onClose}>
      <div className="bg-[#1e2630] rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-white/5" onClick={(e) => e.stopPropagation()}>
        <p className="text-white text-sm mb-6">{t(messageKey)}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 text-sm font-medium disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              if (busy) return
              setBusy(true)
              try {
                await Promise.resolve(onConfirm?.())
                onClose()
              } finally {
                setBusy(false)
              }
            }}
            className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 text-sm font-medium disabled:opacity-50"
          >
            {busy ? t('common.loading') : t(confirmKey)}
          </button>
        </div>
      </div>
    </div>
  )
}
