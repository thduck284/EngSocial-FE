import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MATERIAL_ICON_SUGGESTIONS } from '../../constants/materialIcons'

function FieldLabel({ children }) {
  return <div className="text-xs font-semibold text-slate-300">{children}</div>
}

export function AchievementFormModal({
  open,
  title,
  subtitle,
  accent = 'sky',
  form,
  setForm,
  onClose,
  onSubmit,
  submitText,
}) {
  const { t } = useTranslation()

  const ring =
    accent === 'amber'
      ? 'focus:ring-amber-400/40'
      : accent === 'emerald'
        ? 'focus:ring-emerald-400/50'
        : 'focus:ring-sky-500/60'

  const baseInput = `w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 ${ring}`

  const baseInvalid = !form.name.trim() || !form.howTo.trim()
  let extraInvalid = false
  if ((form.rewardType || 'both') === 'exp') {
    extraInvalid = !Number(form.expAmount || 0)
  } else if ((form.rewardType || 'both') === 'badge') {
    extraInvalid = !(form.badgeName || '').trim()
  }
  const disabled = baseInvalid || extraInvalid

  const iconQuery = (form.icon || '').trim().toLowerCase()
  const iconCandidates = useMemo(() => {
    if (!iconQuery) return MATERIAL_ICON_SUGGESTIONS.slice(0, 6)
    return MATERIAL_ICON_SUGGESTIONS.filter((name) =>
      name.toLowerCase().includes(iconQuery)
    ).slice(0, 8)
  }, [iconQuery])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] rounded-2xl border border-slate-700/80 bg-slate-950 shadow-[0_30px_90px_rgba(0,0,0,0.65)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">{title}</div>
            {subtitle ? (
              <div className="text-[12px] text-slate-400">{subtitle}</div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-2 py-1 text-slate-200 hover:bg-slate-900"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <FieldLabel>
                {t('achievementsPage.fieldName', {
                  defaultValue: 'Tên achievement',
                })}{' '}
                *
              </FieldLabel>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className={baseInput}
                placeholder={t('achievementsPage.placeholderName', {
                  defaultValue: 'Ví dụ: Chuỗi 14 ngày',
                })}
              />
            </label>
            <label className="space-y-1">
              <FieldLabel>
                {t('achievementsPage.fieldIcon', {
                  defaultValue: 'Icon (Material)',
                })}
              </FieldLabel>
              <div className="space-y-1">
                <input
                  value={form.icon}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, icon: e.target.value }))
                  }
                  className={baseInput}
                  placeholder="emoji_events"
                />
                <div className="flex flex-wrap gap-1.5">
                  {iconCandidates.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, icon: name }))}
                      className="flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 px-2 py-0.5 text-[10px] text-slate-200 hover:border-sky-500/70 hover:bg-slate-800"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {name}
                      </span>
                      <span className="truncate max-w-[90px]">{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </label>
          </div>

          <label className="space-y-1 block">
            <FieldLabel>
              {t('achievementsPage.fieldHowTo', {
                defaultValue: 'Cách hoàn thành',
              })}{' '}
              *
            </FieldLabel>
            <textarea
              value={form.howTo}
              onChange={(e) =>
                setForm((p) => ({ ...p, howTo: e.target.value }))
              }
              rows={3}
              className={baseInput}
              placeholder={t('achievementsPage.placeholderHowTo', {
                defaultValue: 'Mô tả điều kiện hoàn thành...',
              })}
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <FieldLabel>
                {t('achievementsPage.fieldRarity', {
                  defaultValue: 'Độ hiếm',
                })}
              </FieldLabel>
              <div className="relative">
                <select
                  value={form.rarity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rarity: e.target.value }))
                  }
                  className={`${baseInput} appearance-none`}
                >
                  <option value="common">
                    {t('achievementsPage.rarity.common', {
                      defaultValue: 'Thường',
                    })}
                  </option>
                  <option value="uncommon">
                    {t('achievementsPage.rarity.uncommon', {
                      defaultValue: 'Không thường',
                    })}
                  </option>
                  <option value="rare">
                    {t('achievementsPage.rarity.rare', {
                      defaultValue: 'Hiếm',
                    })}
                  </option>
                  <option value="epic">
                    {t('achievementsPage.rarity.epic', {
                      defaultValue: 'Sử thi',
                    })}
                  </option>
                  <option value="legendary">
                    {t('achievementsPage.rarity.legendary', {
                      defaultValue: 'Huyền thoại',
                    })}
                  </option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-slate-300">
                  expand_more
                </span>
              </div>
            </label>
            <label className="space-y-1">
              <FieldLabel>
                {t('achievementsPage.fieldRewardType', {
                  defaultValue: 'Loại phần thưởng',
                })}
              </FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'both',
                    label: t('achievementsPage.rewardTypeBoth', {
                      defaultValue: 'Both',
                    }),
                  },
                  {
                    id: 'exp',
                    label: t('achievementsPage.rewardTypeExp', {
                      defaultValue: 'EXP',
                    }),
                  },
                  {
                    id: 'badge',
                    label: t('achievementsPage.rewardTypeBadge', {
                      defaultValue: 'Badge',
                    }),
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, rewardType: opt.id }))
                    }
                    className={`text-xs rounded-full border px-2 py-1 font-semibold ${
                      (form.rewardType || 'both') === opt.id
                        ? 'border-emerald-400/70 bg-emerald-500/20 text-emerald-100'
                        : 'border-slate-700/80 bg-slate-900/60 text-slate-300 hover:border-slate-500/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </label>
            {(form.rewardType || 'both') === 'exp' ||
            (form.rewardType || 'both') === 'both' ? (
              <label className="space-y-1">
                <FieldLabel>
                  {t('achievementsPage.fieldExp', {
                    defaultValue: 'Số EXP',
                  })}
                </FieldLabel>
                <input
                  type="number"
                  min="0"
                  value={form.expAmount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, expAmount: e.target.value }))
                  }
                  className={baseInput}
                  placeholder={t('achievementsPage.placeholderExp', {
                    defaultValue: 'Ví dụ: 200',
                  })}
                />
              </label>
            ) : null}
            {(form.rewardType || 'both') === 'badge' ||
            (form.rewardType || 'both') === 'both' ? (
              <>
                <label className="space-y-1">
                  <FieldLabel>
                    {t('achievementsPage.fieldBadgeName', {
                      defaultValue: 'Tên huy hiệu',
                    })}
                  </FieldLabel>
                  <input
                    value={form.badgeName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, badgeName: e.target.value }))
                    }
                    className={baseInput}
                    placeholder={t('achievementsPage.placeholderBadgeName', {
                      defaultValue: 'Ví dụ: Chăm chỉ 7 ngày',
                    })}
                  />
                </label>
                <label className="space-y-1">
                  <FieldLabel>
                    {t('achievementsPage.fieldBadgeImage', {
                      defaultValue: 'Upload ảnh huy hiệu',
                    })}
                  </FieldLabel>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) {
                        setForm((p) => ({ ...p, badgeImage: '' }))
                        return
                      }
                      const url = URL.createObjectURL(file)
                      setForm((p) => ({ ...p, badgeImage: url }))
                    }}
                    className="w-full text-xs text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-100 hover:file:bg-slate-700"
                  />
                </label>
              </>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <FieldLabel>
                {t('achievementsPage.fieldLinkLabel', {
                  defaultValue: 'Link label (hướng dẫn)',
                })}
              </FieldLabel>
              <input
                value={form.linkLabel}
                onChange={(e) =>
                  setForm((p) => ({ ...p, linkLabel: e.target.value }))
                }
                className={baseInput}
                placeholder={t('achievementsPage.placeholderLinkLabel', {
                  defaultValue: 'Đi tới luyện tập',
                })}
              />
            </label>
            <label className="space-y-1">
              <FieldLabel>
                {t('achievementsPage.fieldLinkTo', {
                  defaultValue: 'Link điều hướng',
                })}
              </FieldLabel>
              <input
                value={form.linkTo}
                onChange={(e) =>
                  setForm((p) => ({ ...p, linkTo: e.target.value }))
                }
                className={baseInput}
                placeholder={t('achievementsPage.placeholderLinkTo', {
                  defaultValue: '/skills/reading hoặc https://...',
                })}
              />
            </label>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-800/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900"
          >
            {t('buttons.cancel')}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  )
}

