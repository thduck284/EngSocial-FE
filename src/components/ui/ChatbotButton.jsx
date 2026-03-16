import { useState } from 'react'
import { ChatbotPanel } from './ChatbotPanel'

export function ChatbotButton() {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)

  return (
    <>
      <ChatbotPanel
        open={open}
        onClose={() => setOpen(false)}
        onMinimize={() => setOpen(false)}
      />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="fixed bottom-8 right-4 size-14 bg-primary text-[#111e22] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 group"
        aria-label="Mở trợ lý AI"
      >
        <span className={`material-symbols-outlined text-3xl ${hover ? 'hidden' : ''}`}>smart_toy</span>
        <span className={`material-symbols-outlined text-3xl fill-icon ${hover ? '' : 'hidden'}`}>forum</span>
        <div className="absolute -top-1 -right-1 size-4 bg-red-500 rounded-full border-2 border-background-dark flex items-center justify-center">
          <span className="text-[8px] text-white font-bold">1</span>
        </div>
      </button>
    </>
  )
}
