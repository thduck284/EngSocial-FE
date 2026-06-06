import { useTranslation } from 'react-i18next'
import { CommunityGroupMembersList } from './CommunityGroupMembersList'

export function CommunityGroupMembersModal({ open, onClose, groupId, onMemberRemovedFromGroup }) {
  const { t } = useTranslation()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl w-full max-w-md shadow-sm flex flex-col min-h-0 max-h-[min(85vh,calc(100dvh-2rem))]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-members-modal-title"
      >
        <div className="px-5 py-4 border-b border-slate-100 dark:border-border-dark flex items-center justify-between shrink-0">
          <p id="group-members-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
            {t('groups.membersModal.title')}
          </p>
          <button
            type="button"
            className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-background-dark text-slate-400 dark:text-gray-400 transition-colors"
            onClick={onClose}
            aria-label={t('groups.membersModal.close')}
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <CommunityGroupMembersList
          groupId={groupId}
          enabled={open && !!groupId}
          variant="bare"
          onBeforeProfileNavigate={onClose}
          onBeforeMessageNavigate={onClose}
          onMemberRemovedFromGroup={onMemberRemovedFromGroup}
        />
      </div>
    </div>
  )
}
