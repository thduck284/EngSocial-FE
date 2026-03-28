import { useTranslation } from 'react-i18next'
import { CommunityGroupMembersList } from './CommunityGroupMembersList'

export function CommunityGroupMembersModal({ open, onClose, groupId, onMemberRemovedFromGroup }) {
  const { t } = useTranslation()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm px-4 pt-20 pb-8 sm:pt-24 sm:pb-10"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col min-h-0 max-h-[min(85vh,calc(100dvh-7rem))] sm:max-h-[min(85vh,calc(100dvh-8rem))]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-members-modal-title"
      >
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <p id="group-members-modal-title" className="text-sm font-semibold text-slate-100">
            {t('groups.membersModal.title', { defaultValue: 'Thành viên nhóm' })}
          </p>
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400"
            onClick={onClose}
            aria-label={t('groups.membersModal.close', { defaultValue: 'Đóng' })}
          >
            <span className="material-symbols-outlined text-sm">close</span>
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
