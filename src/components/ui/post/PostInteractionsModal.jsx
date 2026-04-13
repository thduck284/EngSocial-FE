import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DEFAULT_AVATAR } from '../../../constants/ui'
import { communityService } from '../../../services'
import { ROUTES } from '../../../constants'

export function PostInteractionsModal({
  open,
  onClose,
  type, // 'comments' | 'shares'
  postId,
}) {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !postId || !type) return
    
    setUsers([])
    setLoading(true)
    
    const fetcher = type === 'comments' 
      ? communityService.getPostCommentUsers 
      : communityService.getPostShareUsers

    fetcher(postId)
      .then((res) => {
        const data = res?.data ?? res
        if (data?.users) setUsers(data.users)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, postId, type])

  if (!open) return null

  const title = type === 'comments' 
    ? t('dashboard.commentsUsersTitle')
    : t('dashboard.sharesUsersTitle')

  const emptyMsg = type === 'comments'
    ? t('dashboard.noCommentsYet')
    : t('dashboard.noSharesYet')

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1a353d] rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 dark:border-[#325a67]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-4 border-b border-slate-100 dark:border-[#325a67] flex justify-between items-center">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-[#233f48] rounded-full transition-colors">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>
        
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {loading ? (
            <p className="text-center text-sm text-slate-500 dark:text-[#92bbc9] py-10 italic">...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-sm text-slate-500 dark:text-[#92bbc9] py-10 italic">
              {emptyMsg}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {users.map((u) => (
                <li key={u.userId}>
                  <Link
                    to={u.userId ? ROUTES.PROFILE_USER(u.userId) : '#'}
                    onClick={onClose}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#233f48] transition-colors"
                  >
                    <img 
                      src={u.avatar || DEFAULT_AVATAR} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-slate-200 dark:ring-[#325a67]" 
                    />
                    <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {u.name || '—'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="px-4 py-3 border-t border-slate-100 dark:border-[#325a67] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-200 dark:bg-[#325a67] text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-[#3d6a7a] transition-colors"
          >
            {t('buttons.close') || 'Đóng'}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
