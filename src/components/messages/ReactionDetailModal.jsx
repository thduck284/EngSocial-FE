import { createPortal } from 'react-dom'
import { MESSAGE_REACTION_EMOJIS } from '../../constants'

export function ReactionDetailModal({
  t,
  messageId,
  messages,
  currentUserId,
  user,
  selected,
  selectedReactionEmojiInModal,
  setSelectedReactionEmojiInModal,
  onClose,
}) {
  const detailMsg = messages.find((m) => m.id === messageId)
  if (!detailMsg?.reactions?.length) return null

  const byEmoji = (detailMsg.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1
    return acc
  }, {})
  const byEmojiWithUsers = (detailMsg.reactions || []).reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = []
    acc[r.emoji].push(r.userId)
    return acc
  }, {})
  const getDisplayName = (userId) => (String(userId) === String(currentUserId) ? t('messages.you') : (selected?.name || userId))
  const getAvatar = (userId) => {
    if (String(userId) === String(currentUserId)) {
      return user?.avatar || user?.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'You')}&background=13b6ec&color=fff`
    }
    return selected?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selected?.name || '')}&background=13b6ec&color=fff`
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1e2630] rounded-2xl shadow-2xl w-max min-w-[280px] max-w-[min(90vw,32rem)] max-h-[85vh] flex flex-col overflow-hidden border border-white/5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center px-5 pt-5 pb-4 overflow-x-auto overflow-y-hidden">
          <div className="flex items-center gap-3 flex-nowrap shrink-0">
            {MESSAGE_REACTION_EMOJIS.map((emoji) => {
              const count = byEmoji[emoji] ?? 0
              const hasReactions = count > 0
              const isSelected = selectedReactionEmojiInModal === emoji
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedReactionEmojiInModal(isSelected ? null : emoji)}
                  className={`flex flex-row items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-2xl text-xl transition-all duration-200 ${isSelected ? 'bg-primary/15 ring-1 ring-primary/40 scale-105' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'} ${!hasReactions ? 'opacity-40' : ''}`}
                  title={`${emoji} ${count}`}
                >
                  <span className={`text-sm font-semibold tabular-nums min-w-[1ch] flex justify-end ${hasReactions ? (isSelected ? 'text-primary' : 'text-gray-500') : 'text-gray-600'}`}>{count}</span>
                  <span className="leading-none flex items-center justify-center">{emoji}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex-1 min-h-0 px-5 pb-5 overflow-y-auto">
          {selectedReactionEmojiInModal ? (
            <div className="space-y-0.5">
              {[...new Set(byEmojiWithUsers[selectedReactionEmojiInModal] || [])].map((userId) => (
                <div key={userId} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors">
                  <img src={getAvatar(userId)} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-white/10" />
                  <span className="text-white/90 font-medium truncate">{getDisplayName(userId)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-sm py-8">{t('messages.clickTypeToSee')}</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
