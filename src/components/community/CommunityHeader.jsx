import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { groupService } from '../../services/group.service'

export function CommunityHeader({
  activeGroup,
  activeMembers,
  loadingActive,
  onOpenInvite,
  activeTab,
  onTabChange,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [joinedMenuOpen, setJoinedMenuOpen] = useState(false)
  const totalMembers = activeGroup?.memberCount ?? activeMembers.length ?? 0
  const maxVisible = Math.min(activeMembers.length, 10)
  const visibleMembers = activeMembers.slice(0, maxVisible)
  const remaining = Math.max(0, totalMembers - maxVisible)

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-visible">
      <div
        className="h-40 w-full relative"
        style={
          activeGroup?.icon
            ? {
                backgroundImage: `url(${activeGroup.icon})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {!activeGroup?.icon && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-indigo-600 to-purple-700" />
        )}
        <div className="absolute inset-0 opacity-10 pattern-dots" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-flex items-center px-3 py-1 bg-black/25 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider mb-2">
            <span>
              {activeGroup?.type === 'private'
                ? t('groups.header.private')
                : activeGroup?.type === 'invite_only'
                  ? t('groups.header.hidden')
                  : t('groups.header.public')}
            </span>
            {activeGroup && (
              <>
                <span className="mx-1 text-[9px] text-slate-200">·</span>
                <span className="text-[9px] font-semibold text-slate-200 normal-case">
                  {(activeGroup.memberCount ?? 0)} {t('groups.header.members')}
                </span>
              </>
            )}
          </span>
          <h1 className="text-white text-lg md:text-xl font-extrabold leading-tight">
            {activeGroup?.name || t('groups.header.placeholder')}
          </h1>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {visibleMembers.map((m) => (
              <div
                key={m.id}
                className="size-8 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/profile/${m.id}`)}
              >
                <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
              </div>
            ))}
            {remaining > 0 && (
              <div className="size-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-200">
                +{remaining}
              </div>
            )}
          </div>
          <div className="text-xs text-slate-300 space-y-0.5">
            {loadingActive ? (
              <p className="text-slate-500">{t('groups.header.loading')}</p>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2 relative z-30">
          {/* Mời */}
          <button
            type="button"
            onClick={onOpenInvite}
            className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold flex items-center gap-2 text-white shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            {t('groups.header.invite')}
          </button>
          {/* Chia sẻ */}
          <button className="px-4 py-2 rounded-full bg-slate-100/10 hover:bg-slate-100/20 text-sm font-semibold flex items-center gap-2 text-slate-100 border border-slate-700">
            <span className="material-symbols-outlined text-sm">share</span>
            {t('groups.header.share')}
          </button>
          {/* Đã tham gia (dropdown) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setJoinedMenuOpen((v) => !v)}
              className="px-4 py-2 rounded-full bg-slate-100/5 hover:bg-slate-100/15 text-sm font-semibold flex items-center gap-1.5 text-slate-100 border border-slate-700"
            >
              <span className="material-symbols-outlined text-sm">groups</span>
              <span>{t('groups.header.joined')}</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>
            {joinedMenuOpen && activeGroup && (
              <div className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-slate-900 border border-slate-800 shadow-lg text-xs text-slate-100 z-50">
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-t-xl"
                  onClick={async () => {
                    try {
                      await groupService.leave(activeGroup.id || activeGroup._id)
                      window.location.reload()
                    } catch {
                      // ignore
                    }
                  }}
                >
                  <span className="material-symbols-outlined text-[16px] text-rose-300">
                    logout
                  </span>
                  <span>{t('groups.header.leave')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Tabs dưới avatar giống Facebook: Giới thiệu, Bài viết, Mọi người, File phương tiện, File, Search icon */}
      <div className="px-4 pb-2 border-t border-slate-800">
        <div className="flex items-center gap-10 overflow-x-auto custom-scrollbar mt-4">
          <button
            type="button"
            onClick={() => onTabChange?.('about')}
            className={`pb-2 text-sm ${
              activeTab === 'about'
                ? 'font-semibold text-white border-b-2 border-emerald-500'
                : 'font-medium text-slate-300 hover:text-white hover:border-b-2 hover:border-slate-500'
            }`}
          >
            {t('groups.header.tabAbout', { defaultValue: 'Giới thiệu' })}
          </button>
          <button
            type="button"
            onClick={() => onTabChange?.('posts')}
            className={`pb-2 text-sm ${
              activeTab === 'posts'
                ? 'font-semibold text-white border-b-2 border-emerald-500'
                : 'font-medium text-slate-300 hover:text-white hover:border-b-2 hover:border-slate-500'
            }`}
          >
            {t('groups.header.tabDiscussion', { defaultValue: 'Bài viết' })}
          </button>
          <button
            type="button"
            onClick={() => onTabChange?.('people')}
            className={`pb-2 text-sm ${
              activeTab === 'people'
                ? 'font-semibold text-white border-b-2 border-emerald-500'
                : 'font-medium text-slate-300 hover:text-white hover:border-b-2 hover:border-slate-500'
            }`}
          >
            {t('groups.header.tabPeople', { defaultValue: 'Mọi người' })}
          </button>
          <button
            type="button"
            onClick={() => onTabChange?.('media')}
            className={`pb-2 text-sm ${
              activeTab === 'media'
                ? 'font-semibold text-white border-b-2 border-emerald-500'
                : 'font-medium text-slate-300 hover:text-white hover:border-b-2 hover:border-slate-500'
            }`}
          >
            {t('groups.header.tabMedia', { defaultValue: 'File phương tiện' })}
          </button>
          <button
            type="button"
            onClick={() => onTabChange?.('files')}
            className={`pb-2 text-sm ${
              activeTab === 'files'
                ? 'font-semibold text-white border-b-2 border-emerald-500'
                : 'font-medium text-slate-300 hover:text-white hover:border-b-2 hover:border-slate-500'
            }`}
          >
            {t('groups.header.tabFiles', { defaultValue: 'File' })}
          </button>

          <div className="ml-auto flex items-center mb-2">
            <button
              type="button"
              className="w-20 h-15 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              <span className="material-symbols-outlined text-lg">search</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

