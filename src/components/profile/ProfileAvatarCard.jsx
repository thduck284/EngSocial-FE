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
    <div className="bg-white dark:bg-card-dark rounded-2xl p-8 border border-slate-200 dark:border-border-dark flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="w-40 h-40 rounded-full border-4 border-primary p-1 overflow-hidden">
          <img
            alt=""
            className="w-full h-full rounded-full object-cover"
            src={displayAvatar}
          />
        </div>
        <button
          type="button"
          className="absolute bottom-2 right-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center border-4 border-white dark:border-card-dark shadow hover:bg-primary/90 transition-colors"
          title={t('profile.changeAvatar')}
          onClick={onOpenAvatarModal}
        >
          <span className="material-symbols-outlined text-sm">photo_camera</span>
        </button>
      </div>
      <h2 className="text-2xl font-bold dark:text-white">{displayName}</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
        {t('dashboard.level')} {displayLevel} ·{' '}
        <span className="text-primary">{displayXp} XP</span>
      </p>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 mb-2 overflow-hidden">
        <div
          className="bg-primary h-4 rounded-full transition-all duration-300"
          style={{
            width: `${xpPercent}%`,
            boxShadow: '0 0 10px rgba(19, 182, 236, 0.4)',
          }}
        />
      </div>
      <div className="flex justify-between w-full text-xs text-slate-500 font-medium">
        <span>
          {t('profile.currentLevel')} {displayLevel}
        </span>
        <span>
          {Math.max(0, displayXpMax - displayXp)} XP {t('profile.toLevel')}{' '}
          {displayLevel + 1}
        </span>
      </div>
    </div>
  )
}

