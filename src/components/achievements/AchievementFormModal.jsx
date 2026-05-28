import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MATERIAL_ICON_SUGGESTIONS } from '../../constants/materialIcons'
import { createTargetFormRow } from '../../utils/achievementI18n.js'

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
  variant = 'edit',
  locale = 'vi',
  suggestions = [],
}) {
  const { t } = useTranslation()
  const [fieldLang, setFieldLang] = useState('vi')
  /** Mốc đang mở panel phần thưởng (≥2 mốc); chỉ một id tại một thời điểm. */
  const [openRewardRowId, setOpenRewardRowId] = useState(null)

  useEffect(() => {
    if (!open) {
      setOpenRewardRowId(null)
      return
    }
    setFieldLang(String(locale || '').toLowerCase().startsWith('en') ? 'en' : 'vi')
  }, [open, locale])
  const showSuggest =
    (variant === 'add' || variant === 'edit') &&
    Array.isArray(suggestions) &&
    suggestions.length > 0
  const showTargets =
    (variant === 'add' || variant === 'edit') && Array.isArray(form.targets)

  const ring =
    accent === 'amber'
      ? 'focus:ring-amber-400/40'
      : accent === 'emerald'
        ? 'focus:ring-emerald-400/50'
        : 'focus:ring-sky-500/60'

  const baseInput = `w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 ${ring}`

  const baseInvalid =
    !(form.howToVi || '').trim() || !(form.howToEn || '').trim()
  let targetsInvalid = false
  if (showTargets) {
    const rows = form.targets || []
    const filledRows = rows.filter(
      (r) => String(r?.value ?? '').trim() !== ''
    )
    targetsInvalid =
      !filledRows.length ||
      filledRows.some((r) =>
        Number.isNaN(Number(String(r.value).replace(',', '.')))
      ) ||
      filledRows.some(
        (r) =>
          !(String(r.labelVi || '').trim()) ||
          !(String(r.labelEn || '').trim())
      )
  }
  const usePerTargetRewards = (form.targets || []).length >= 2
  let extraInvalid = false
  if (usePerTargetRewards) {
    const rows = form.targets || []
    const filledRows = rows.filter((r) => String(r?.value ?? '').trim() !== '')
    extraInvalid =
      !filledRows.length ||
      filledRows.some((r) => {
        const rt = r.rewardType || 'exp'
        const xpOk = Number(r.xpReward || 0) > 0
        const bVi = String(r.badgeNameVi || '').trim()
        const bEn = String(r.badgeNameEn || '').trim()
        if (rt === 'exp') return !xpOk
        if (rt === 'badge') return !bVi || !bEn
        if (rt === 'both') return !xpOk || !bVi || !bEn
        return true
      })
  } else if ((form.rewardType || 'both') === 'exp') {
    extraInvalid = !Number(form.expAmount || 0)
  } else if ((form.rewardType || 'both') === 'badge') {
    extraInvalid =
      !(form.badgeNameVi || '').trim() || !(form.badgeNameEn || '').trim()
  } else if ((form.rewardType || 'both') === 'both') {
    extraInvalid =
      !Number(form.expAmount || 0) ||
      !(form.badgeNameVi || '').trim() ||
      !(form.badgeNameEn || '').trim()
  }
  const disabled = baseInvalid || extraInvalid || targetsInvalid

  const applySuggestion = (s) => {
    const viText = String(s.vi || '')
    const enText = String(s.en || '')
    const milestones = Array.isArray(s.requirement?.milestones)
      ? s.requirement.milestones
      : null

    if (milestones?.length) {
      setForm((p) => ({
        ...p,
        suggestionKey: s.key,
        howToVi: viText,
        howToEn: enText,
        targets: milestones.map((m) =>
          createTargetFormRow(
            String(m.vi || '').trim(),
            String(m.en || '').trim(),
            String(m.value ?? ''),
            {
              xpReward:
                m.xpReward != null ? String(m.xpReward) : '10',
              rewardType: m.rewardType || 'exp',
              badgeNameVi: m.badgeName || m.badgeNameVi || '',
              badgeNameEn: m.badgeNameEn || '',
              badgeIcon: m.badgeIcon || '',
            }
          )
        ),
      }))
      return
    }

    const defV =
      s.requirement != null && s.requirement.value != null
        ? String(s.requirement.value)
        : ''
    const labelVi = viText.length > 80 ? `${viText.slice(0, 77)}…` : viText
    const labelEn = enText.length > 80 ? `${enText.slice(0, 77)}…` : enText
    setForm((p) => ({
      ...p,
      suggestionKey: s.key,
      howToVi: viText,
      howToEn: enText,
      targets: [
        {
          ...createTargetFormRow(),
          labelVi,
          labelEn,
          label: labelVi || labelEn,
          value: defV,
        },
      ],
    }))
  }

  const addTargetRow = () => {
    setForm((p) => ({
      ...p,
      targets: [...(p.targets || []), createTargetFormRow()],
    }))
  }

  const removeTargetRow = (id) => {
    setOpenRewardRowId((cur) => (cur === id ? null : cur))
    setForm((p) => {
      const list = p.targets || []
      if (list.length <= 1) return p
      return { ...p, targets: list.filter((r) => r.id !== id) }
    })
  }

  const patchTarget = (id, field, raw) => {
    setForm((p) => ({
      ...p,
      targets: (p.targets || []).map((r) =>
        r.id === id ? { ...r, [field]: raw } : r
      ),
    }))
  }

  const iconQuery = (form.icon || '').trim().toLowerCase()
  const iconCandidates = useMemo(() => {
    if (!iconQuery) return MATERIAL_ICON_SUGGESTIONS.slice(0, 6)
    return MATERIAL_ICON_SUGGESTIONS.filter((name) =>
      name.toLowerCase().includes(iconQuery)
    ).slice(0, 8)
  }, [iconQuery])

  const badgeIconQuery = (form.badgeIcon || '').trim().toLowerCase()
  const badgeIconCandidates = useMemo(() => {
    if (!badgeIconQuery) return MATERIAL_ICON_SUGGESTIONS.slice(0, 6)
    return MATERIAL_ICON_SUGGESTIONS.filter((name) =>
      name.toLowerCase().includes(badgeIconQuery)
    ).slice(0, 8)
  }, [badgeIconQuery])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] max-h-[min(90vh,880px)] flex flex-col rounded-2xl border border-slate-700/80 bg-slate-950 shadow-[0_30px_90px_rgba(0,0,0,0.65)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-5 py-4 border-b border-slate-800/80 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-bold text-white">{title}</div>
            {subtitle ? (
              <div className="text-[12px] text-slate-400">{subtitle}</div>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="flex rounded-lg border border-slate-600/80 bg-slate-900/80 p-0.5"
              role="group"
              aria-label={t('achievementsPage.modalLangToggle', {
                defaultValue: 'Form language',
              })}
            >
              <button
                type="button"
                onClick={() => setFieldLang('vi')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                  fieldLang === 'vi'
                    ? 'bg-sky-500/25 text-sky-100 border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('achievementsPage.langVi', { defaultValue: 'VI' })}
              </button>
              <button
                type="button"
                onClick={() => setFieldLang('en')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                  fieldLang === 'en'
                    ? 'bg-sky-500/25 text-sky-100 border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('achievementsPage.langEn', { defaultValue: 'EN' })}
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-2 py-1 text-slate-200 hover:bg-slate-900"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3 custom-scroll-thin">
          <label className="space-y-1 block">
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

          <label className="space-y-1 block">
            <FieldLabel>
              {fieldLang === 'vi'
                ? t('achievementsPage.fieldHowToVi', {
                    defaultValue: 'Cách hoàn thành (Tiếng Việt)',
                  })
                : t('achievementsPage.fieldHowToEn', {
                    defaultValue: 'How to complete (English)',
                  })}{' '}
              *
            </FieldLabel>
            <textarea
              value={
                fieldLang === 'vi' ? form.howToVi || '' : form.howToEn || ''
              }
              onChange={(e) =>
                setForm((p) =>
                  fieldLang === 'vi'
                    ? { ...p, howToVi: e.target.value }
                    : { ...p, howToEn: e.target.value }
                )
              }
              rows={3}
              className={baseInput}
              placeholder={
                fieldLang === 'vi'
                  ? t('achievementsPage.placeholderHowToVi', {
                      defaultValue: 'Mô tả điều kiện hoàn thành...',
                    })
                  : t('achievementsPage.placeholderHowToEn', {
                      defaultValue: 'Describe how to unlock...',
                    })
              }
            />
          </label>

          {showSuggest ? (
            <div className="space-y-2">
              <FieldLabel>
                {t('achievementsPage.suggestedTitle', {
                  defaultValue: 'Gợi ý theo danh mục',
                })}
              </FieldLabel>
              <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto custom-scroll-thin pr-1">
                {suggestions.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => applySuggestion(s)}
                    className={`max-w-full text-left rounded-xl border px-3 py-2 text-[11px] leading-snug transition-colors ${
                      form.suggestionKey === s.key
                        ? 'border-emerald-400/70 bg-emerald-500/15 text-emerald-50'
                        : 'border-slate-700/80 bg-slate-900/70 text-slate-200 hover:border-slate-500/80'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-slate-500 block mb-0.5">
                      {s.key}
                    </span>
                    <span className="line-clamp-2">
                      {fieldLang === 'vi' ? s.vi : s.en}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {showTargets ? (
            <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <FieldLabel>
                  {t('achievementsPage.targetsTitle', {
                    defaultValue: 'Danh sách target (mốc)',
                  })}
                </FieldLabel>
                <button
                  type="button"
                  onClick={addTargetRow}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-500/20"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  {t('achievementsPage.addTargetRow', { defaultValue: 'Thêm target' })}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                {t('achievementsPage.targetsHint', {
                  defaultValue:
                    'Mỗi mốc: bật VI/EN ở góc để nhập mô tả từng ngôn ngữ (dùng làm tên achievement) và giá trị số. Có thể thêm nhiều mốc.',
                })}
              </p>
              <div className="space-y-2">
                {(form.targets || []).map((row) => (
                  <div key={row.id} className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_88px_auto] gap-2 sm:items-stretch">
                    <label className="space-y-1 min-w-0">
                      <span className="text-[10px] text-slate-500">
                        {fieldLang === 'vi'
                          ? t('achievementsPage.targetLabelVi', {
                              defaultValue: 'Mô tả mốc (VI)',
                            })
                          : t('achievementsPage.targetLabelEn', {
                              defaultValue: 'Milestone (EN)',
                            })}
                      </span>
                      <input
                        value={
                          fieldLang === 'vi'
                            ? row.labelVi ?? row.label ?? ''
                            : row.labelEn ?? ''
                        }
                        onChange={(e) =>
                          patchTarget(
                            row.id,
                            fieldLang === 'vi' ? 'labelVi' : 'labelEn',
                            e.target.value
                          )
                        }
                        className={baseInput}
                        placeholder={
                          fieldLang === 'vi'
                            ? t(
                                'achievementsPage.targetLabelPlaceholderVi',
                                {
                                  defaultValue:
                                    'Ví dụ: Đăng nhập 7 ngày liên tiếp',
                                }
                              )
                            : t(
                                'achievementsPage.targetLabelPlaceholderEn',
                                {
                                  defaultValue:
                                    'E.g. 7 consecutive login days',
                                }
                              )
                        }
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-[10px] text-slate-500">
                        {t('achievementsPage.targetValueField', {
                          defaultValue: 'Giá trị',
                        })}
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={row.value}
                        onChange={(e) =>
                          patchTarget(row.id, 'value', e.target.value)
                        }
                        className={baseInput}
                        placeholder="1"
                      />
                    </label>
                    <div className="flex flex-col justify-end gap-1.5 min-h-[2.75rem] sm:min-h-0">
                      <div className="flex justify-end gap-1.5">
                        {usePerTargetRewards ? (
                          <button
                            type="button"
                            onClick={() =>
                              setOpenRewardRowId((cur) =>
                                cur === row.id ? null : row.id
                              )
                            }
                            className={`rounded-lg border px-2 py-2 text-[11px] font-semibold leading-none ${
                              openRewardRowId === row.id
                                ? 'border-amber-400/60 bg-amber-500/20 text-amber-100'
                                : 'border-slate-600/80 bg-slate-900/70 text-slate-200 hover:border-slate-500/80'
                            }`}
                            title={t('achievementsPage.targetRewardsToggle', {
                              defaultValue: 'Phần thưởng',
                            })}
                          >
                            <span className="material-symbols-outlined text-[18px] align-middle">
                              card_giftcard
                            </span>
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removeTargetRow(row.id)}
                          disabled={(form.targets || []).length <= 1}
                          className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-rose-200 hover:bg-rose-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={t('achievementsPage.removeTargetRow', {
                            defaultValue: 'Xóa dòng',
                          })}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                    </div>
                  {usePerTargetRewards && openRewardRowId === row.id ? (
                    <div className="space-y-2 rounded-lg border border-slate-800/60 bg-slate-950/50 p-2.5">
                      <div className="text-[10px] font-semibold text-slate-400">
                        {t('achievementsPage.targetRewardsTitle', {
                          defaultValue: 'Phần thưởng mốc này',
                        })}
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['both', 'exp', 'badge'].map((opt) => (
                          <button
                            key={`${row.id}-${opt}`}
                            type="button"
                            onClick={() =>
                              patchTarget(row.id, 'rewardType', opt)
                            }
                            className={`text-[10px] rounded-lg border px-1.5 py-1 font-semibold ${
                              (row.rewardType || 'exp') === opt
                                ? 'border-emerald-400/70 bg-emerald-500/20 text-emerald-100'
                                : 'border-slate-700/80 bg-slate-900/60 text-slate-400'
                            }`}
                          >
                            {opt === 'both'
                              ? t('achievementsPage.rewardTypeBoth', {
                                  defaultValue: 'Both',
                                })
                              : opt === 'exp'
                                ? t('achievementsPage.rewardTypeExp', {
                                    defaultValue: 'EXP',
                                  })
                                : t('achievementsPage.rewardTypeBadge', {
                                    defaultValue: 'Badge',
                                  })}
                          </button>
                        ))}
                      </div>
                      {(row.rewardType || 'exp') === 'exp' ||
                      (row.rewardType || 'exp') === 'both' ? (
                        <label className="block space-y-0.5">
                          <span className="text-[10px] text-slate-500">
                            {t('achievementsPage.fieldExp', {
                              defaultValue: 'EXP mốc',
                            })}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={row.xpReward ?? ''}
                            onChange={(e) =>
                              patchTarget(row.id, 'xpReward', e.target.value)
                            }
                            className={baseInput}
                          />
                        </label>
                      ) : null}
                      {(row.rewardType || 'exp') === 'badge' ||
                      (row.rewardType || 'exp') === 'both' ? (
                        <div className="space-y-2">
                          <label className="block space-y-0.5">
                            <span className="text-[10px] text-slate-500">
                              {fieldLang === 'vi'
                                ? t('achievementsPage.fieldBadgeNameVi', {
                                    defaultValue: 'Tên badge (VI)',
                                  })
                                : t('achievementsPage.fieldBadgeNameEn', {
                                    defaultValue: 'Badge (EN)',
                                  })}
                            </span>
                            <input
                              value={
                                fieldLang === 'vi'
                                  ? row.badgeNameVi || ''
                                  : row.badgeNameEn || ''
                              }
                              onChange={(e) =>
                                patchTarget(
                                  row.id,
                                  fieldLang === 'vi'
                                    ? 'badgeNameVi'
                                    : 'badgeNameEn',
                                  e.target.value
                                )
                              }
                              className={baseInput}
                            />
                          </label>
                          <label className="block space-y-0.5">
                            <span className="text-[10px] text-slate-500">
                              {t('achievementsPage.fieldBadgeIcon', {
                                defaultValue: 'Icon badge',
                              })}
                            </span>
                            <input
                              value={row.badgeIcon || ''}
                              onChange={(e) =>
                                patchTarget(row.id, 'badgeIcon', e.target.value)
                              }
                              className={baseInput}
                              placeholder="emoji_events"
                            />
                          </label>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

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
            {!usePerTargetRewards ? (
              <>
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
                    <label className="space-y-1 sm:col-span-2">
                      <FieldLabel>
                        {fieldLang === 'vi'
                          ? t('achievementsPage.fieldBadgeNameVi', {
                              defaultValue: 'Tên huy hiệu (Tiếng Việt)',
                            })
                          : t('achievementsPage.fieldBadgeNameEn', {
                              defaultValue: 'Badge name (English)',
                            })}
                      </FieldLabel>
                      <input
                        value={
                          fieldLang === 'vi'
                            ? form.badgeNameVi || ''
                            : form.badgeNameEn || ''
                        }
                        onChange={(e) =>
                          setForm((p) =>
                            fieldLang === 'vi'
                              ? { ...p, badgeNameVi: e.target.value }
                              : { ...p, badgeNameEn: e.target.value }
                          )
                        }
                        className={baseInput}
                        placeholder={
                          fieldLang === 'vi'
                            ? t('achievementsPage.placeholderBadgeNameVi', {
                                defaultValue: 'Ví dụ: Chăm chỉ 7 ngày',
                              })
                            : t('achievementsPage.placeholderBadgeNameEn', {
                                defaultValue: 'E.g. 7-day streak',
                              })
                        }
                      />
                    </label>
                    <label className="space-y-1 sm:col-span-2">
                      <FieldLabel>
                        {t('achievementsPage.fieldBadgeIcon', {
                          defaultValue: 'Icon badge (Material)',
                        })}
                      </FieldLabel>
                      <input
                        value={form.badgeIcon || ''}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, badgeIcon: e.target.value }))
                        }
                        className={baseInput}
                        placeholder="military_tech"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {badgeIconCandidates.map((name) => (
                          <button
                            key={`badge-${name}`}
                            type="button"
                            onClick={() =>
                              setForm((p) => ({ ...p, badgeIcon: name }))
                            }
                            className="flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 px-2 py-0.5 text-[10px] text-slate-200 hover:border-amber-500/70 hover:bg-slate-800"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {name}
                            </span>
                            <span className="truncate max-w-[90px]">{name}</span>
                          </button>
                        ))}
                      </div>
                    </label>
                  </>
                ) : null}
              </>
            ) : (
              <p className="text-[11px] text-slate-500 leading-snug">
                {t('achievementsPage.perTargetRewardsHint', {
                  defaultValue:
                    'EXP và badge được cấu hình theo từng mốc ở khối phía trên.',
                })}
              </p>
            )}
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

        <div className="shrink-0 px-5 py-4 border-t border-slate-800/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900"
          >
            {t('buttons.cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof onSubmit === 'function') onSubmit()
            }}
            disabled={disabled || typeof onSubmit !== 'function'}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  )
}

