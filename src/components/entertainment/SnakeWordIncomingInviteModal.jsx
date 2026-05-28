import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function WordScrambleIncomingInviteModal({ invite, onAccept, onCancel }) {
  const { t } = useTranslation()
  const [dontDisturb, setDontDisturb] = useState(false)

  if (!invite) return null

  const handleAccept = () => {
    if (dontDisturb) {
      // Logic block trong 5 phút sẽ được xử lý tại AppHeader trước khi show modal
      // Nhưng chúng ta vẫn đánh dấu ở đây nếu cần
    }
    onAccept(invite)
  }

  const handleCancel = () => {
    if (dontDisturb) {
      const blockUntil = Date.now() + 5 * 60 * 1000
      localStorage.setItem(`block_invite_${invite.inviterId}`, blockUntil.toString())
    }
    onCancel()
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        onClick={handleCancel}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-fuchsia-500/50 rounded-[2.5rem] shadow-[0_0_50px_rgba(217,70,239,0.3)] overflow-hidden ws-fade-rise">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 size-48 bg-fuchsia-500/20 blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 size-48 bg-cyan-500/20 blur-[80px]" />

        <div className="p-8 flex flex-col items-center text-center relative z-10">
          <div className="size-24 rounded-3xl bg-gradient-to-tr from-fuchsia-600 to-violet-600 flex items-center justify-center mb-6 shadow-2xl shadow-fuchsia-500/40 rotate-3">
             <span className="material-symbols-outlined text-5xl text-white transform -rotate-3">gamepad</span>
          </div>

          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">
             {t('enter.game.inviteTitle', 'Lời mời thách đấu!')}
          </h2>
          
          <p className="text-slate-300 text-lg mb-8 px-4">
            <span className="font-black text-fuchsia-400">@{invite.inviterName}</span> đang đợi bạn trong phòng chờ <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">{invite.roomCode}</span>. Bạn đã sẵn sàng chưa?
          </p>

          {/* Checkbox */}
          <label className="flex items-center gap-3 mb-10 cursor-pointer group py-2 px-4 rounded-xl hover:bg-white/5 transition-colors">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                className="peer appearance-none size-5 rounded border-2 border-slate-700 checked:bg-fuchsia-600 checked:border-fuchsia-600 transition-all"
                checked={dontDisturb}
                onChange={(e) => setDontDisturb(e.target.checked)}
              />
              <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-sm font-black">check</span>
              </span>
            </div>
            <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors font-medium">
              Không nhận lời mời từ người này trong 5 phút
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-4 w-full">
            <button 
              onClick={handleCancel}
              className="flex-1 py-4 rounded-2xl bg-slate-800 text-slate-300 font-black uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            >
              Hủy
            </button>
            <button 
              onClick={handleAccept}
              className="flex-[1.5] py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(217,70,239,0.4)] hover:shadow-[0_15px_40px_rgba(217,70,239,0.5)] transition-all hover:-translate-y-1 active:scale-95"
            >
              Đồng ý ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
