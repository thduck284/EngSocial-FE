export function LeaveGroupConfirmModal({ t, open, onClose, onConfirm }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1e2630] rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-white/5" onClick={(e) => e.stopPropagation()}>
        <p className="text-white text-sm mb-6">{t('messages.leaveGroupConfirm')}</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 text-sm font-medium">
            {t('common.cancel')}
          </button>
          <button type="button" onClick={() => { onConfirm(); onClose() }} className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 text-sm font-medium">
            {t('messages.leaveGroup')}
          </button>
        </div>
      </div>
    </div>
  )
}
