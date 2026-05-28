/** @param {string} [lng] */
export function pickLang(vi, en, lng) {
  const useVi = !String(lng || '').toLowerCase().startsWith('en')
  const v = vi != null ? String(vi).trim() : ''
  const e = en != null ? String(en).trim() : ''
  if (useVi) return v || e
  return e || v
}

function normProgress(p) {
  const n = Number(p)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

/** Các dòng mốc có giá trị số > 0, sắp xếp theo ngưỡng tăng dần. */
export function getSortedMilestoneRows(targets) {
  if (!Array.isArray(targets) || !targets.length) return []
  return targets
    .filter((r) => String(r?.value ?? '').trim() !== '')
    .map((r) => ({
      ...r,
      _threshold: Number(String(r.value).replace(',', '.')) || 0,
    }))
    .filter((r) => r._threshold > 0)
    .sort((a, b) => a._threshold - b._threshold)
}

/**
 * Mốc đang hướng tới: ngưỡng đầu tiên mà progress chưa đạt;
 * nếu đã vượt mọi ngưỡng thì trả về mốc cuối (đã hoàn thành cả chuỗi).
 */
export function pickActiveMilestoneRow(targets, progress) {
  const rows = getSortedMilestoneRows(targets)
  if (!rows.length) return null
  const p = normProgress(progress)
  const next = rows.find((r) => p < r._threshold)
  return next || rows[rows.length - 1]
}

/** Tiêu đề hiển thị một mốc đang active (theo progress). */
export function milestoneTitleActive(a, lng) {
  const row = pickActiveMilestoneRow(a?.targets, a?.progress ?? 0)
  if (!row) return ''
  const vi = String(row.labelVi ?? row.label ?? '').trim()
  const en = String(row.labelEn ?? row.label ?? '').trim()
  if (!vi && !en) return ''
  return pickLang(vi, en, lng)
}

/** Toàn bộ mốc nối bằng · — dùng khi cần xem full (vd. export). */
export function milestoneTitlesJoined(a, lng) {
  if (!Array.isArray(a?.targets) || !a.targets.length) return ''
  const parts = []
  for (const row of getSortedMilestoneRows(a.targets)) {
    const vi = String(row.labelVi ?? row.label ?? '').trim()
    const en = String(row.labelEn ?? row.label ?? '').trim()
    if (!vi && !en) continue
    parts.push(pickLang(vi, en, lng))
  }
  return parts.length ? parts.join(' · ') : ''
}

export function pickAchievementName(a, lng) {
  if (!a) return ''
  const active = milestoneTitleActive(a, lng)
  if (active) return active
  const v = a.nameVi != null ? String(a.nameVi).trim() : ''
  const e = a.nameEn != null ? String(a.nameEn).trim() : ''
  if (v || e) return pickLang(v, e, lng)
  return String(a.name || '').trim()
}

export function pickAchievementHowToBase(a, lng) {
  if (!a) return ''
  const v = a.howToBaseVi != null ? String(a.howToBaseVi).trim() : ''
  const e = a.howToBaseEn != null ? String(a.howToBaseEn).trim() : ''
  if (v || e) return pickLang(v, e, lng)
  const legacy = a.howToBase != null ? String(a.howToBase).trim() : ''
  if (legacy) return legacy
  return String(a.howTo || '').trim()
}

export function pickAchievementBadgeName(a, lng) {
  if (!a) return ''
  const v =
    a.badgeNameVi != null && String(a.badgeNameVi).trim()
      ? String(a.badgeNameVi).trim()
      : String(a.badgeName || '').trim()
  const e = a.badgeNameEn != null ? String(a.badgeNameEn).trim() : ''
  if (v || e) return pickLang(v, e, lng)
  return String(a.badgeName || '').trim()
}

/** API achievement: có ≥2 mốc và ít nhất một mốc có phần thưởng riêng. */
export function apiUsesPerMilestoneRewards(apiA) {
  const ms = apiA?.requirement?.milestones
  if (!Array.isArray(ms) || ms.length < 2) return false
  return ms.some(
    (m) =>
      Number(m?.xpReward) > 0 ||
      (m?.rewardType && m.rewardType !== 'exp') ||
      (m?.badgeName && String(m.badgeName).trim()) ||
      (m?.badgeNameEn && String(m.badgeNameEn).trim()) ||
      (m?.badgeIcon && String(m.badgeIcon).trim())
  )
}

/** Chuỗi phần thưởng từ một dòng mốc (đã map lên `targets`). */
export function rewardsFromTargetRow(row, t, lng) {
  if (!row) return []
  const rewards = []
  const rt = row.rewardType || 'exp'
  const xp = Number(row.xpReward ?? row.expAmount ?? 0)
  const bnVi = String(row.badgeNameVi ?? '').trim()
  const bnEn = String(row.badgeNameEn ?? '').trim()
  const bn = pickLang(bnVi, bnEn, lng)
  if ((rt === 'exp' || rt === 'both') && xp > 0) {
    rewards.push(t('achievementsPage.rewardXp', { count: xp }))
  }
  if ((rt === 'badge' || rt === 'both') && bn) {
    rewards.push(t('achievementsPage.rewardBadge', { name: bn }))
  }
  return rewards
}

export function createTargetFormRow(
  labelVi = '',
  labelEn = '',
  value = '',
  extra = {}
) {
  const vi = labelVi != null ? String(labelVi) : ''
  const en = labelEn != null ? String(labelEn) : ''
  const xp =
    extra.xpReward != null && extra.xpReward !== ''
      ? String(extra.xpReward)
      : ''
  return {
    id:
      globalThis.crypto?.randomUUID?.() ||
      `t-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    labelVi: vi,
    labelEn: en,
    /** @deprecated use labelVi / labelEn */
    label: vi || en,
    value: value != null ? String(value) : '',
    xpReward: xp,
    rewardType: extra.rewardType || 'exp',
    badgeNameVi: extra.badgeNameVi != null ? String(extra.badgeNameVi) : '',
    badgeNameEn: extra.badgeNameEn != null ? String(extra.badgeNameEn) : '',
    badgeIcon: extra.badgeIcon != null ? String(extra.badgeIcon) : '',
    badgeImage: extra.badgeImage != null ? String(extra.badgeImage) : '',
  }
}

/** Ghép mô tả chính + khối các mốc target. `lang` = 'vi' | 'en' chọn nhãn mốc. */
export function buildHowToWithTargetBlock(baseHow, filledRows, t, lang) {
  const base = String(baseHow || '').trim()
  if (!filledRows.length) return base
  const useEn = String(lang || '').toLowerCase() === 'en'
  const lines = filledRows.map((row, idx) => {
    const vi = String(row.labelVi ?? row.label ?? '').trim()
    const en = String(row.labelEn ?? row.label ?? '').trim()
    const lab = useEn ? en || vi : vi || en
    const val = String(row.value ?? '').trim()
    if (lab)
      return `${lab} — ${t('achievementsPage.targetValueLabel')}: ${val}`
    return t('achievementsPage.targetRowFallback', {
      n: idx + 1,
      value: val,
    })
  })
  return `${base}\n\n${t('achievementsPage.targetsBlockTitle')}\n${lines.join('\n')}`
}

/** Mô tả đầy đủ (gồm target) theo ngôn ngữ UI — chỉ mốc đang active nếu có nhiều mốc. */
export function getAchievementHowToPreview(a, lng, t) {
  if (!a) return ''
  const base = pickAchievementHowToBase(a, lng)
  const filled = Array.isArray(a.targets)
    ? a.targets.filter((r) => String(r?.value ?? '').trim() !== '')
    : []
  if (!filled.length) {
    const v = a.howToVi != null ? String(a.howToVi).trim() : ''
    const e = a.howToEn != null ? String(a.howToEn).trim() : ''
    if (v || e) return pickLang(v, e, lng)
    return String(a.howTo || '').trim()
  }
  const sorted = getSortedMilestoneRows(filled)
  let activeRow = null
  if (sorted.length > 1) {
    activeRow = pickActiveMilestoneRow(filled, a?.progress ?? 0)
  } else if (sorted.length === 1) {
    activeRow = sorted[0]
  }
  const rowsForBlock = activeRow
    ? [
        {
          labelVi: activeRow.labelVi,
          labelEn: activeRow.labelEn,
          label: activeRow.label,
          value: activeRow.value,
        },
      ]
    : filled
  const langKey = String(lng || '').toLowerCase().startsWith('en') ? 'en' : 'vi'
  return buildHowToWithTargetBlock(base, rowsForBlock, t, langKey)
}

/** Ngưỡng tối đa để tính % (mốc cuối hoặc requirement.value). */
export function getAchievementMaxGoalFromItem(a) {
  const rows = getSortedMilestoneRows(a?.targets)
  if (rows.length) return rows[rows.length - 1]._threshold
  const ms = a?.requirement?.milestones
  if (Array.isArray(ms) && ms.length) {
    const vals = ms
      .map((m) => Number(m.value))
      .filter((n) => Number.isFinite(n) && n > 0)
    if (vals.length) return Math.max(...vals)
  }
  const v = Number(a?.requirement?.value)
  return Number.isFinite(v) && v > 0 ? v : 0
}

/**
 * Dữ liệu hiển thị thanh tiến độ (current/goal, %).
 * `completed` ưu tiên từ API (`a.completed`); không có thì suy từ progress >= goal.
 */
export function getAchievementProgressState(a, t) {
  const activeRow = pickActiveMilestoneRow(a?.targets, a?.progress ?? 0)
  const goal = activeRow ? activeRow._threshold : getAchievementMaxGoalFromItem(a)
  const p = normProgress(a?.progress)
  if (goal <= 0) {
    return { show: false, completed: !!a?.completed }
  }
  const capped = Math.min(p, goal)
  const percent = Math.min(100, (capped / goal) * 100)
  const completed =
    a?.completed != null ? !!a.completed : p >= goal
  const sorted = getSortedMilestoneRows(a?.targets)
  let milestonesLine = ''
  if (sorted.length > 1 && typeof t === 'function') {
    const done = sorted.filter((r) => p >= r._threshold).length
    milestonesLine = t('achievementsPage.progressMilestonesCount', {
      done,
      total: sorted.length,
      defaultValue: `Mốc ${done}/${sorted.length}`,
    })
  }
  return {
    show: true,
    current: capped,
    goal,
    rawProgress: p,
    percent,
    completed,
    milestonesLine,
  }
}
