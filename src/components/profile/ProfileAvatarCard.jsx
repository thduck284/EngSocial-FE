export function ProfileAvatarCard({
  t,
  displayName,
  displayLevel,
  displayXp,
  displayXpMax,
  displayAvatar,
  xpPercent,
  onOpenAvatarModal,
}) {
  return (
    <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-border-dark shadow-sm flex flex-col items-center text-center">
      <div className="relative mb-4">
        <div className="size-28 rounded-full border-2 border-primary p-0.5 overflow-hidden">
          <img
            alt=""
            className="w-full h-full rounded-full object-cover"
            src={displayAvatar}
          />
        </div>
        <button
          type="button"
          className="absolute bottom-1 right-1 size-8 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white dark:border-card-dark shadow-sm hover:bg-primary/90 transition-colors"
          title={t('profile.changeAvatar')}
          onClick={onOpenAvatarModal}
        >
          <span className="material-symbols-outlined text-sm">photo_camera</span>
        </button>
      </div>
      <h2 className="text-base font-bold dark:text-white">{displayName}</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
        {t('dashboard.level')} {displayLevel || 1} ·{' '}
        <span className="text-primary">{displayXp || 0} XP</span>
      </p>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{
            width: `${xpPercent}%`,
            boxShadow: '0 0 8px rgba(19, 182, 236, 0.4)',
          }}
        />
      </div>
      <div className="flex justify-between w-full text-[10px] text-slate-500 font-medium">
        <span>
          {t('profile.currentLevel')} {displayLevel || 1}
        </span>
        <span>
          {Math.max(0, (displayXpMax || 500) - (displayXp || 0))} XP {t('profile.toLevel')}{' '}
          {(displayLevel || 1) + 1}
        </span>
      </div>
    </div>
  )
}
