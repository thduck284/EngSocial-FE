import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../../constants'
import { DEFAULT_AVATAR } from '../../../constants/ui'

export function MentionedUsersModal({ open, onClose, mentions = [] }) {
  const { t } = useTranslation()
  if (!open) return null
  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-[#111e22] rounded-xl shadow-xl border border-slate-200 dark:border-[#325a67] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('dashboard.mentionedUsers') || 'Nguoi duoc nhac den'}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#325a67]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t('dashboard.mentionedUsers') || 'Nguoi duoc nhac den'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#233f48] text-slate-500 dark:text-[#92bbc9] transition-colors"
            aria-label={t('buttons.close') || 'Dong'}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          {mentions.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500 dark:text-[#92bbc9]">
              {t('dashboard.noMentions') || 'Khong co.'}
            </p>
          ) : (
            <ul className="py-2">
              {mentions.map((m) => {
                const id = m?.id ?? (typeof m === 'string' ? m : '')
                const name = (m?.name ?? id) || '—'
                const avatar =
                  m?.avatar ||
                  (name !== '—'
                    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13b6ec&color=fff`
                    : DEFAULT_AVATAR)
                return (
                  <li key={id}>
                    <Link
                      to={ROUTES.PROFILE_USER(id)}
                      onClick={onClose}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-[#233f48] transition-colors"
                    >
                      <img src={avatar} alt="" className="size-10 rounded-full object-cover shrink-0" />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
  return createPortal(modalContent, document.body)
}
