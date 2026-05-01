import { useTranslation } from 'react-i18next'
import {
  getAchievementHowToPreview,
  getAchievementProgressState,
  pickAchievementBadgeName,
  pickAchievementName,
} from '../../utils/achievementI18n.js'

export function AchievementDetails({
  t,
  achievement,
  category,
  onGoToLink,
  onEdit,
  onDelete,
  canManage = false,
}) {
  const { i18n, t: tHook } = useTranslation()
  const lng = i18n.language
  const tr = typeof t === 'function' ? t : tHook
  const prog = achievement ? getAchievementProgressState(achievement, tr) : { show: false }
  if (!achievement) {
    if (category?.title) {
      const empty = !(category.items && category.items.length)
      return (
        <div className="space-y-4 h-full min-h-0 overflow-hidden">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {category.title}
            </h3>
            {category.description ? (
              <p className="mt-2 text-sm text-slate-300/90 leading-relaxed">
                {category.description}
              </p>
            ) : null}
          </div>
          {empty ? (
            <p className="text-slate-400 text-sm">
              {t?.('achievementsPage.emptyCategory')}
            </p>
          ) : (
            <p className="text-slate-400 text-sm">
              {t?.('achievementsPage.noAchievementSelected')}
            </p>
          )}
        </div>
      )
    }
    return (
      <div className="text-slate-400 text-sm">
        {t?.('achievementsPage.noAchievementSelected')}
      </div>
    )
  }

  return (
    <div className="space-y-4 min-h-0">
      <div className="flex items-start gap-3">
        <div className="size-16 rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-500/5 to-transparent border border-amber-300/40 flex items-center justify-center shadow-[0_0_35px_rgba(250,204,21,0.45)] shrink-0 overflow-hidden">
          {achievement.unlocked && (achievement.badgeImage || achievement.badgeIcon) ? (
            achievement.badgeImage ? (
              <img
                src={achievement.badgeImage}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-4xl text-amber-300">
                {achievement.badgeIcon || 'military_tech'}
              </span>
            )
          ) : (
            <span className="material-symbols-outlined text-3xl text-amber-300">
              {achievement.icon || 'emoji_events'}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-xl font-bold text-white tracking-tight">
            {pickAchievementName(achievement, lng)}
          </h3>
          <div className="text-sm text-slate-300/90 flex flex-wrap items-center gap-2">
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

      {prog.show ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 w-full min-w-0">
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">
            {t?.('achievementsPage.progressTitle', { defaultValue: 'Tiến độ' })}
          </h4>
          <div className="flex w-full min-w-0 flex-col gap-1.5">
            <div className="flex w-full min-w-0 justify-between items-baseline gap-2 text-sm text-slate-200 leading-none">
              <span className="tabular-nums truncate">
                {tr?.('achievementsPage.progressFraction', {
                  current: prog.current,
                  goal: prog.goal,
                  defaultValue: `${prog.current} / ${prog.goal}`,
                })}
              </span>
              {prog.completed ? (
                <span className="text-emerald-400 font-semibold inline-flex items-center gap-1 text-xs shrink-0 leading-none">
                  <span className="material-symbols-outlined text-[18px] leading-none">check_circle</span>
                  {tr?.('achievementsPage.progressComplete', { defaultValue: 'Hoàn thành' })}
                </span>
              ) : null}
            </div>
            <div
              className="relative h-3 w-full min-w-0 overflow-hidden rounded-full bg-slate-800 ring-1 ring-inset ring-slate-950/80"
              role="progressbar"
              aria-valuenow={prog.rawProgress}
              aria-valuemin={0}
              aria-valuemax={prog.goal}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-[width] duration-300 ease-out"
                style={{
                  width: `${prog.percent}%`,
                  minWidth: prog.percent > 0 ? '6px' : undefined,
                }}
              />
            </div>
            {prog.milestonesLine ? (
              <p className="text-[11px] text-slate-500 leading-snug tabular-nums">
                {prog.milestonesLine}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

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
        <p className="text-base text-slate-100 leading-relaxed whitespace-pre-line line-clamp-5">
          {getAchievementHowToPreview(achievement, lng, t)}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
          {t?.('achievementsPage.rewardsTitle', { defaultValue: 'Nhận được gì' })}
        </h4>

        {/* Per-milestone rewards breakdown */}
        {Array.isArray(achievement.requirement?.milestones) && achievement.requirement.milestones.length > 0 ? (
          <ul className="space-y-2">
            {achievement.requirement.milestones
              .slice()
              .sort((a, b) => Number(a.value) - Number(b.value))
              .map((m) => {
                const mVal = Number(m.value)
                const reached = (achievement.progress ?? 0) >= mVal
                const rt = m.rewardType || 'exp'
                const xp = Number(m.xpReward || 0)
                const badgeName = lng && !String(lng).toLowerCase().startsWith('en')
                  ? (m.badgeName || m.badgeNameEn || '')
                  : (m.badgeNameEn || m.badgeName || '')
                const label = lng && !String(lng).toLowerCase().startsWith('en')
                  ? (m.vi || m.en || '')
                  : (m.en || m.vi || '')
                return (
                  <li
                    key={mVal}
                    className={`rounded-xl border px-3 py-2 flex items-start gap-3 ${
                      reached
                        ? 'border-emerald-500/30 bg-emerald-500/10'
                        : 'border-slate-700/60 bg-slate-900/50'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${reached ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {reached ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${reached ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {label || `${mVal} ${achievement.requirement?.type?.replace(/_/g, ' ') || ''}`}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(rt === 'exp' || rt === 'both') && xp > 0 && (
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${reached ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>
                            +{xp} XP
                          </span>
                        )}
                        {(rt === 'badge' || rt === 'both') && badgeName && (
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${reached ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>
                            <span className="material-symbols-outlined text-[12px]">
                              {m.badgeIcon || 'military_tech'}
                            </span>
                            {badgeName}
                          </span>
                        )}
                        {(rt === 'badge' || rt === 'both') && !badgeName && m.badgeIcon && (
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${reached ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>
                            <span className="material-symbols-outlined text-[12px]">{m.badgeIcon}</span>
                            Badge
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
          </ul>
        ) : (
          /* Fallback: flat rewards list */
          <ul className="space-y-2 text-base">
            {(achievement.rewards || []).slice(0, 5).map((r) => (
              <li key={r} className="flex items-center gap-2 text-sm text-emerald-100">
                <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
                <span>{r}</span>
              </li>
            ))}
            {!(achievement.rewards?.length) && (
              <li className="text-sm text-slate-500">
                {t?.('achievementsPage.noRewards', { defaultValue: 'Chưa có thông tin phần thưởng' })}
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}

