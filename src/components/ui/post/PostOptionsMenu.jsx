import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function PostOptionsMenu({
  isOwnPost,
  isSavedPost,
  disabled = false,
  onToggleSave,
  onEdit,
  onDelete,
  onReport,
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open])

  const wrapAction = (fn) => {
    if (disabled || typeof fn !== 'function') return
    fn()
    setOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-slate-400 dark:text-[#92bbc9] hover:bg-slate-100 dark:hover:bg-[#233f48] rounded p-1"
      >
        <span className="material-symbols-outlined">more_horiz</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 z-20 rounded-xl border border-slate-200 dark:border-[#325a67] bg-white dark:bg-[#111e22] shadow-lg p-1.5">
          <button
            type="button"
            onClick={() => wrapAction(onToggleSave)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-[#233f48] inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSavedPost ? 'bookmark_remove' : 'bookmark'}
            </span>
            {isSavedPost ? t('dashboard.unsavePost') : t('dashboard.savePost')}
          </button>
          {isOwnPost ? (
            <>
              <button
                type="button"
                onClick={() => wrapAction(onEdit)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-[#233f48] inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                {t('dashboard.editPost')}
              </button>
              <button
                type="button"
                onClick={() => wrapAction(onDelete)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                {t('dashboard.deletePost')}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => wrapAction(onReport)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">flag</span>
              {t('dashboard.reportPost')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
