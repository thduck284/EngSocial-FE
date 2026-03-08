import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants'

export function ConversationRightSidebar({
  t,
  selected,
  openSettingsMenu,
  setOpenSettingsMenu,
  getSettingsUntil,
  getDisappearingDurationSeconds,
  applyConversationSettings,
  setShowDeleteAllConfirm,
  rightBarMedia,
  rightBarFiles,
  rightBarLinks,
  rightBarMediaVisible,
  rightBarFilesVisible,
  rightBarLinksVisible,
  loadMoreMedia,
  loadMoreFiles,
  loadMoreLinks,
  setRightBarMediaVisibleCount,
  setRightBarFilesVisibleCount,
  setRightBarLinksVisibleCount,
  openImageViewer,
  scrollToMessage,
  downloadAttachment,
}) {
  return (
    <aside className="hidden xl:flex w-[320px] flex-shrink-0 flex-col min-h-0 border-l border-border-dark bg-background-dark overflow-y-auto overflow-x-hidden">
      <div className="p-8 flex flex-col items-center text-center shrink-0">
        <div className="w-32 h-32 rounded-full p-1 border-4 border-primary/20 mb-4 overflow-hidden">
          <img src={selected?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selected?.name || '')}&background=13b6ec&color=fff`} alt="" className="w-full h-full rounded-full object-cover" />
        </div>
        <h4 className="text-xl font-bold text-white">{selected?.name}</h4>
        <p className="text-gray-500 text-sm mt-1">{selected?.isGroup ? '' : t('messages.learnerLevel')}</p>
        <div className="mt-6 w-full space-y-3">
          {!selected?.isGroup && selected?.otherUserId && (
            <Link to={ROUTES.PROFILE_USER(selected.otherUserId)} className="block w-full py-2.5 px-4 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors text-center">
              {t('messages.viewProfile')}
            </Link>
          )}
          <button type="button" className="w-full py-2.5 px-4 rounded-xl bg-card-dark border border-border-dark font-bold text-sm text-white hover:opacity-80 transition-opacity">
            {t('messages.searchInChat')}
          </button>
        </div>
      </div>
      <div className="px-6 space-y-6 pb-6 shrink-0">
        <div>
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t('messages.options')}</h5>
          <div className="space-y-1">
            <div className="relative">
              <button type="button" onClick={() => setOpenSettingsMenu((v) => (v === 'mute' ? null : 'mute'))} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-card-dark transition-colors text-white">
                <span className="text-sm font-medium">{t('messages.muteNotifications')}</span>
                <span className={`material-symbols-outlined ${selected?.muted ? 'text-primary' : 'text-gray-400'}`}>{selected?.muted ? 'notifications_off' : 'notifications'}</span>
              </button>
              {openSettingsMenu === 'mute' && (
                <div className="absolute top-full left-0 right-0 mt-0.5 py-1 rounded-xl bg-card-dark border border-border-dark shadow-xl z-20">
                  {selected?.muted ? (
                    <button type="button" onClick={() => applyConversationSettings({ mutedUntil: null })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">notifications</span>
                      {t('messages.turnNotificationsOn')}
                    </button>
                  ) : (
                    <>
                      <button type="button" onClick={() => applyConversationSettings({ mutedUntil: getSettingsUntil('1h') })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10">{t('messages.muteFor1h')}</button>
                      <button type="button" onClick={() => applyConversationSettings({ mutedUntil: getSettingsUntil('8h') })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10">{t('messages.muteFor8h')}</button>
                      <button type="button" onClick={() => applyConversationSettings({ mutedUntil: getSettingsUntil('forever') })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10">{t('messages.muteUntilTurnOn')}</button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <button type="button" onClick={() => setOpenSettingsMenu((v) => (v === 'disappearing' ? null : 'disappearing'))} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-card-dark transition-colors text-white">
                <span className="text-sm font-medium">{t('messages.disappearingMessages')}</span>
                <span className={`material-symbols-outlined ${selected?.disappearing ? 'text-primary' : 'text-gray-400'}`}>timer</span>
              </button>
              {openSettingsMenu === 'disappearing' && (
                <div className="absolute top-full left-0 right-0 mt-0.5 py-1 rounded-xl bg-card-dark border border-border-dark shadow-xl z-20">
                  {selected?.disappearing ? (
                    <button type="button" onClick={() => applyConversationSettings({ disappearingUntil: null })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">timer_off</span>
                      {t('messages.disappearingOff')}
                    </button>
                  ) : (
                    <>
                      <button type="button" onClick={() => applyConversationSettings({ disappearingUntil: getSettingsUntil('1h'), disappearingDurationSeconds: getDisappearingDurationSeconds('1h') })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10">{t('messages.muteFor1h')}</button>
                      <button type="button" onClick={() => applyConversationSettings({ disappearingUntil: getSettingsUntil('8h'), disappearingDurationSeconds: getDisappearingDurationSeconds('8h') })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10">{t('messages.muteFor8h')}</button>
                      <button type="button" onClick={() => applyConversationSettings({ disappearingUntil: getSettingsUntil('24h'), disappearingDurationSeconds: getDisappearingDurationSeconds('24h') })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10">{t('messages.muteFor24h')}</button>
                      <button type="button" onClick={() => applyConversationSettings({ disappearingUntil: getSettingsUntil('forever'), disappearingDurationSeconds: getDisappearingDurationSeconds('forever') })} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10">{t('messages.disappearingUntilTurnOff')}</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1 mt-4">
            <button type="button" onClick={() => setShowDeleteAllConfirm(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-card-dark transition-colors text-white">
              <span className="text-sm font-medium">{t('messages.deleteAllMessages')}</span>
              <span className="material-symbols-outlined text-gray-400">delete_sweep</span>
            </button>
          </div>
        </div>
        <div>
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t('messages.mediaSection')}</h5>
          <div className="grid grid-cols-3 gap-2">
            {rightBarMedia.length === 0 ? (
              <p className="col-span-3 text-gray-500 text-sm py-2">—</p>
            ) : (
              rightBarMedia.slice(0, rightBarMediaVisible).map((a, i) =>
                a.type?.startsWith('video/') ? (
                  <a key={`${a.url}-${i}`} href={a.url} target="_blank" rel="noopener noreferrer" className="aspect-square bg-card-dark rounded-lg overflow-hidden border border-border-dark flex items-center justify-center hover:opacity-90">
                    <span className="material-symbols-outlined text-primary">play_circle</span>
                  </a>
                ) : (
                  <div key={`${a.url}-${i}`} className="relative aspect-square bg-card-dark rounded-lg overflow-hidden border border-border-dark group/thumb">
                    <button type="button" onClick={() => openImageViewer(a.url, a.messageId)} className="block w-full h-full">
                      <img src={a.url} alt="" className="w-full h-full object-cover hover:opacity-90" />
                    </button>
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                      <span className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center cursor-pointer shrink-0" title={t('messages.viewOriginalMessage')} onClick={(e) => { e.stopPropagation(); scrollToMessage(a.messageId) }}>
                        <span className="material-symbols-outlined text-white text-sm">visibility</span>
                      </span>
                      <span className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center cursor-pointer shrink-0" title={t('common.download')} onClick={(e) => { e.stopPropagation(); downloadAttachment(a.url, a.name || 'image') }}>
                        <span className="material-symbols-outlined text-white text-sm">download</span>
                      </span>
                    </div>
                  </div>
                )
              )
            )}
            {rightBarMedia.length > rightBarMediaVisible && (
              <button type="button" disabled={loadMoreMedia} onClick={setRightBarMediaVisibleCount} className="col-span-3 py-2 rounded-lg bg-card-dark hover:bg-white/10 text-sm text-primary font-medium disabled:opacity-50 flex items-center justify-center gap-1">
                {loadMoreMedia ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : null}
                {t('messages.viewAll')}
              </button>
            )}
          </div>
        </div>
        <div>
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t('messages.fileSection')}</h5>
          <div className="space-y-1">
            {rightBarFiles.length === 0 ? (
              <p className="text-gray-500 text-sm py-2">—</p>
            ) : (
              rightBarFiles.slice(0, rightBarFilesVisible).map((a, i) => (
                <div key={`${a.url}-${i}`} className="group/file flex items-center gap-2 p-2 rounded-lg hover:bg-card-dark text-sm text-gray-200 min-w-0">
                  <span className="material-symbols-outlined text-primary shrink-0">attach_file</span>
                  <span className="truncate flex-1 min-w-0">{a.name || 'File'}</span>
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover/file:opacity-100 transition-opacity">
                    <span className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center cursor-pointer" title={t('messages.viewOriginalMessage')} onClick={() => scrollToMessage(a.messageId)}>
                      <span className="material-symbols-outlined text-white text-sm">visibility</span>
                    </span>
                    <span className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center cursor-pointer" title={t('common.download')} onClick={() => downloadAttachment(a.url, a.name || 'file')}>
                      <span className="material-symbols-outlined text-white text-sm">download</span>
                    </span>
                  </div>
                </div>
              ))
            )}
            {rightBarFiles.length > rightBarFilesVisible && (
              <button type="button" disabled={loadMoreFiles} onClick={setRightBarFilesVisibleCount} className="w-full py-2 rounded-lg bg-card-dark hover:bg-white/10 text-sm text-primary font-medium disabled:opacity-50 flex items-center justify-center gap-1">
                {loadMoreFiles ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : null}
                {t('messages.viewAll')}
              </button>
            )}
          </div>
        </div>
        <div>
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t('messages.linkSection')}</h5>
          <div className="space-y-1">
            {rightBarLinks.length === 0 ? (
              <p className="text-gray-500 text-sm py-2">—</p>
            ) : (
              rightBarLinks.slice(0, rightBarLinksVisible).map((item, i) => (
                <div key={`${item.url}-${item.messageId}-${i}`} className="group/link flex items-center gap-2 p-2 rounded-lg hover:bg-card-dark text-sm min-w-0">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="truncate flex-1 min-w-0 text-primary hover:underline">
                    {item.url}
                  </a>
                  <span className="w-7 h-7 shrink-0 rounded-full bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover/link:opacity-100 transition-opacity" title={t('messages.viewOriginalMessage')} onClick={() => scrollToMessage(item.messageId)}>
                    <span className="material-symbols-outlined text-white text-sm">visibility</span>
                  </span>
                </div>
              ))
            )}
            {rightBarLinks.length > rightBarLinksVisible && (
              <button type="button" disabled={loadMoreLinks} onClick={setRightBarLinksVisibleCount} className="w-full py-2 rounded-lg bg-card-dark hover:bg-white/10 text-sm text-primary font-medium disabled:opacity-50 flex items-center justify-center gap-1">
                {loadMoreLinks ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : null}
                {t('messages.viewAll')}
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
