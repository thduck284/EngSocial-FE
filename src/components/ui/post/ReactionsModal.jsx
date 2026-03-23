import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { POST_REACTION_TYPES, REACTION_TYPE_TO_EMOJI } from '../../../constants'
import { DEFAULT_AVATAR } from '../../../constants/ui'
import { communityService } from '../../../services'

export function ReactionsModal({
  open,
  onClose,
  mode,
  entityId,
  initialTab = 'all',
  likeCount = 0,
  initialReactionCounts = {},
}) {
  const { t } = useTranslation()
  const [reactions, setReactions] = useState([])
  const [reactionCounts, setReactionCounts] = useState(initialReactionCounts)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab, open])

  useEffect(() => {
    if (!open || !entityId || (mode !== 'post' && mode !== 'comment')) return
    setLoading(true)
    const fetcher =
      mode === 'post' ? communityService.getPostReactions : communityService.getCommentReactions

    fetcher(entityId)
      .then((res) => {
        const data = res?.data ?? res
        if (data?.reactions) setReactions(data.reactions)
        if (data?.reactionCounts && typeof data.reactionCounts === 'object') {
          setReactionCounts(data.reactionCounts)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, entityId, mode])

  const totalCount = Number(likeCount) || reactions.length
  const tabTypes = ['all', ...POST_REACTION_TYPES.filter((type) => (reactionCounts[type] || 0) > 0)]

  const getCountForTab = (tab) => {
    if (tab === 'all') return totalCount
    return reactionCounts[tab] || 0
  }

  const filteredReactions = activeTab === 'all' ? reactions : reactions.filter((r) => r.reaction === activeTab)

  if (!open) return null

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1a353d] rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 dark:border-[#325a67]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-2 border-b border-slate-100 dark:border-[#325a67]">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {t('dashboard.reactionsModalTitle')}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-3 overflow-x-auto overflow-y-hidden">
            {tabTypes.map((tab) => {
              const count = getCountForTab(tab)
              const isSelected = activeTab === tab
              const label =
                tab === 'all'
                  ? t('dashboard.reactionsModalAll')
                  : t(`dashboard.reaction${tab.charAt(0).toUpperCase() + tab.slice(1)}`)
              const icon = tab === 'all' ? null : REACTION_TYPE_TO_EMOJI[tab]
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl text-sm font-medium transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary ring-1 ring-primary/30'
                      : 'bg-slate-100 dark:bg-[#233f48] text-slate-600 dark:text-[#92bbc9] hover:bg-slate-200 dark:hover:bg-[#325a67]'
                  }`}
                  title={tab === 'all' ? `${label} ${count}` : `${icon} ${label} ${count}`}
                >
                  {icon && <span className="text-base leading-none">{icon}</span>}
                  <span>{label}</span>
                  <span className="tabular-nums opacity-90">{count}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {loading ? (
            <p className="text-center text-sm text-slate-500 dark:text-[#92bbc9] py-6">...</p>
          ) : filteredReactions.length === 0 ? (
            <p className="text-center text-sm text-slate-500 dark:text-[#92bbc9] py-6">
              {t('dashboard.noCommentsYet')}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {filteredReactions.map((r) => (
                <li key={r.userId}>
                  <Link
                    to={r.userId ? `/profile/${r.userId}` : '#'}
                    onClick={onClose}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#233f48] transition-colors"
                  >
                    <img src={r.avatar || DEFAULT_AVATAR} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-slate-200 dark:ring-[#325a67]" />
                    <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {r.name || '—'}
                    </span>
                    {activeTab === 'all' && r.reaction && (
                      <span className="text-lg leading-none shrink-0" title={r.reaction}>
                        {REACTION_TYPE_TO_EMOJI[r.reaction]}
                      </span>
                    )}
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
            {t('buttons.close')}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
