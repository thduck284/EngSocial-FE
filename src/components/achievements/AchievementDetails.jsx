export function AchievementDetails({
  t,
  achievement,
  onGoToLink,
  onEdit,
  onDelete,
  canManage = false,
}) {
  if (!achievement) {
    return (
      <div className="text-slate-400 text-sm">
        {t?.('achievementsPage.noAchievementSelected')}
      </div>
    )
  }

  return (
    <div className="space-y-4 h-full min-h-0 overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="size-16 rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-500/5 to-transparent border border-amber-300/40 flex items-center justify-center shadow-[0_0_35px_rgba(250,204,21,0.45)]">
          <span className="material-symbols-outlined text-3xl text-amber-300">
            {achievement.icon || 'emoji_events'}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-white tracking-tight">
            {achievement.name}
          </h3>
          <div className="mt-1 text-sm text-slate-300/90 flex flex-wrap items-center gap-2">
            {t?.('achievementsPage.rarityLabel', { defaultValue: 'Độ hiếm' }) ||
              'Độ hiếm'}
            :{' '}
            <span className="inline-flex items-center rounded-full bg-black/40 border border-white/10 px-2 py-0.5 text-[11px] font-semibold">
              {t?.(`achievementsPage.rarity.${achievement.rarity}`, {
                defaultValue: achievement.rarity,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {achievement.link?.to ? (
          <button
            type="button"
            onClick={() => onGoToLink?.(achievement.link)}
            className="w-full rounded-2xl border border-sky-400/30 bg-sky-500/15 px-4 py-3 text-sm font-bold text-sky-100 hover:bg-sky-500/20 hover:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-500/60 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
            {achievement.link?.label || t?.('buttons.next', { defaultValue: 'Đi tới' }) || 'Đi tới'}
          </button>
        ) : (
          <div className="w-full rounded-2xl border border-slate-800/80 bg-slate-950/70 px-4 py-3 text-sm text-slate-400 flex items-center justify-center">
            {t?.('achievementsPage.noGuide', {
              defaultValue: 'Chưa có hướng dẫn',
            })}
          </div>
        )}

        {canManage ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(achievement)}
              className="w-full rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-100 hover:bg-amber-500/15 hover:border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              {t?.('achievementsPage.edit', { defaultValue: 'Sửa' })}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="w-full rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-100 hover:bg-rose-500/15 hover:border-rose-400/40 focus:outline-none focus:ring-2 focus:ring-rose-400/40 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                delete
              </span>
              {t?.('achievementsPage.delete', { defaultValue: 'Xóa' })}
            </button>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">
          {t?.('achievementsPage.howTo', { defaultValue: 'Cách hoàn thành' })}
        </h4>
        <p className="text-base text-slate-100 leading-relaxed line-clamp-5">
          {achievement.howTo}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">
          {t?.('achievementsPage.rewardsTitle', {
            defaultValue: 'Nhận được gì',
          })}
        </h4>
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-[11px] text-slate-400">
            {t?.('achievementsPage.rewardTypeLabel', {
              defaultValue: 'Loại phần thưởng',
            }) || 'Loại phần thưởng'}
            :{' '}
            <span className="font-semibold text-slate-200">
              {achievement.rewardType === 'exp'
                ? t?.('achievementsPage.rewardTypeExp', { defaultValue: 'EXP' }) ||
                  'EXP'
                : achievement.rewardType === 'badge'
                  ? t?.('achievementsPage.rewardTypeBadge', {
                      defaultValue: 'Badge',
                    }) || 'Badge'
                  : t?.('achievementsPage.rewardTypeBoth', {
                      defaultValue: 'Both',
                    }) || 'Both'}
            </span>
          </p>
          {achievement.badgeImage &&
          (achievement.rewardType === 'badge' ||
            achievement.rewardType === 'both') ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                {t?.('achievementsPage.badgePreviewLabel', {
                  defaultValue: 'Badge:',
                })}
              </span>
              <img
                src={
                  typeof achievement.badgeImage === 'string'
                    ? achievement.badgeImage
                    : ''
                }
                alt={achievement.badgeName || 'badge'}
                className="w-8 h-8 rounded-full border border-slate-700/80 object-cover"
              />
            </div>
          ) : null}
        </div>
        <ul className="space-y-2 text-base">
          {(achievement.rewards || []).slice(0, 5).map((r) => (
            <li key={r} className="flex items-center gap-2 text-sm text-emerald-100">
              <span className="material-symbols-outlined text-[18px] text-emerald-400">
                check_circle
              </span>
              <span>{r}</span>
            </li>
          ))}
          {(achievement.rewards || []).length > 5 ? (
            <li className="text-[12px] text-slate-400">
              {t?.('achievementsPage.moreRewards', {
                count: (achievement.rewards || []).length - 5,
                defaultValue: `+${(achievement.rewards || []).length - 5} phần thưởng khác`,
              })}
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  )
}

