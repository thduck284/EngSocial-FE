import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ACHIEVEMENT_CATEGORY_DEFS } from '../constants/achievementsCatalog'
import { userService, achievementsService } from '../services'
import { getSuggestedAchievementsForCategory } from '../utils/achievementSuggestions'
import {
  apiUsesPerMilestoneRewards,
  buildHowToWithTargetBlock,
  createTargetFormRow,
  pickAchievementBadgeName,
  pickActiveMilestoneRow,
  pickLang,
  rewardsFromTargetRow,
} from '../utils/achievementI18n.js'
import i18n from '../i18n/config.js'

function assignAchievementToCategory(a) {
  const k = String(a.key || '').toLowerCase()
  const type = a.type
  if (type === 'skill') return 'skills'
  if (type === 'challenge') return 'quests'
  if (type === 'streak') return 'learning'
  if (type === 'special') {
    if (/vocab|flash|word|note|card/.test(k)) return 'vocab'
    return 'learning'
  }
  if (type === 'social') {
    if (/friend|chat|message|follow|dm|group/.test(k)) return 'social'
    if (/post|comment|like|forum|community|share|feed/.test(k)) return 'community'
    return 'community'
  }
  return 'learning'
}

function targetsFromBeRequirement(req) {
  if (!req?.milestones?.length) return undefined
  return req.milestones.map((m) => ({
    labelVi: String(m.vi || '').trim(),
    labelEn: String(m.en || '').trim(),
    value: String(m.value ?? ''),
    xpReward:
      m.xpReward != null && m.xpReward !== '' ? String(m.xpReward) : '',
    rewardType: m.rewardType || 'exp',
    badgeNameVi: String(m.badgeName || '').trim(),
    badgeNameEn: String(m.badgeNameEn || '').trim(),
    badgeIcon: m.badgeIcon != null ? String(m.badgeIcon) : '',
    badgeImage: m.badgeImage != null ? String(m.badgeImage) : '',
  }))
}

/** Đã gộp vào `login_streak`; giữ trong DB sẽ trùng UI — ẩn cho tới khi seed xóa. */
const LEGACY_ACHIEVEMENT_KEYS = new Set(['login_streak_7', 'login_streak_30'])

function buildRewardsFromBe(a, t, lng) {
  const rewards = []
  const xp = Number(a.xpReward || 0)
  const rt = a.rewardType || 'both'
  if ((rt === 'exp' || rt === 'both') && xp > 0) {
    rewards.push(t('achievementsPage.rewardXp', { count: xp }))
  }
  const bn = pickAchievementBadgeName(a, lng)
  if ((rt === 'badge' || rt === 'both') && bn) {
    rewards.push(t('achievementsPage.rewardBadge', { name: bn }))
  }
  return rewards
}

function beAchievementToItem(a, t, idx, lng) {
  const categoryId = assignAchievementToCategory(a)
  const descVi = a.description || ''
  const descEn = a.descriptionEn || descVi
  const targets = targetsFromBeRequirement(a.requirement)
  let nmVi = a.name || ''
  let nmEn = a.nameEn != null && String(a.nameEn).trim() ? String(a.nameEn).trim() : nmVi
  if (targets?.length) {
    const pVi = targets
      .filter((r) => String(r.value).trim())
      .map((r) => r.labelVi || r.labelEn)
      .filter(Boolean)
    const pEn = targets
      .filter((r) => String(r.value).trim())
      .map((r) => r.labelEn || r.labelVi)
      .filter(Boolean)
    if (pVi.length) nmVi = pVi.join(' · ')
    if (pEn.length) nmEn = pEn.join(' · ')
  }
  const perMilestone = apiUsesPerMilestoneRewards(a) && targets?.length
  const activeRow =
    perMilestone && targets?.length
      ? pickActiveMilestoneRow(targets, a.progress ?? 0)
      : null
  let rewards = buildRewardsFromBe(a, t, lng)
  let rewardType = a.rewardType || 'both'
  let expAmount = Number(a.xpReward || 0) || 0
  let bnVi = a.badgeName || ''
  let bnEn = a.badgeNameEn || bnVi
  let badgeImage = a.badgeImage
  let badgeIcon = a.badgeIcon
  if (perMilestone && activeRow && !a.unlocked) {
    // Not yet unlocked: show the reward for the NEXT milestone to aim for
    rewards = rewardsFromTargetRow(activeRow, t, lng)
    rewardType = activeRow.rewardType || 'exp'
    expAmount = Number(activeRow.xpReward || 0) || 0
    bnVi = String(activeRow.badgeNameVi || '').trim()
    bnEn = String(activeRow.badgeNameEn || '').trim()
    badgeImage = activeRow.badgeImage
    badgeIcon = activeRow.badgeIcon
  } else if (perMilestone && a.unlocked) {
    // Already unlocked: the API service already resolved badge/rewardType to the
    // highest earned milestone — just use them directly.
    rewardType = a.rewardType || 'both'
    expAmount = Number(a.xpReward || 0) || 0
    bnVi = String(a.badgeName || '').trim()
    bnEn = String(a.badgeNameEn || bnVi).trim()
    badgeImage = a.badgeImage
    badgeIcon = a.badgeIcon
    rewards = buildRewardsFromBe(a, t, lng)
  }
  return {
    id: a.id,
    key: a.key,
    name: pickLang(nmVi, nmEn, lng),
    nameVi: nmVi,
    nameEn: nmEn,
    icon: a.icon || 'emoji_events',
    rarity: a.rarity || 'common',
    howTo: pickLang(descVi, descEn, lng),
    howToVi: descVi,
    howToEn: descEn,
    howToBaseVi: descVi,
    howToBaseEn: descEn,
    rewards,
    rewardType,
    expAmount,
    badgeName: pickLang(bnVi, bnEn, lng),
    badgeNameVi: bnVi,
    badgeNameEn: bnEn,
    badgeImage,
    badgeIcon,
    earnedBadges: a.earnedBadges || [], // NEW: list of all earned badges from BE
    link: a.linkTo ? {
      label: pickLang(a.linkLabel, a.linkLabelEn, lng) || t('achievementsPage.fieldLinkLabel'),
      to: a.linkTo
    } : undefined,
    order: a.order ?? idx,
    categoryId,
    unlocked: a.unlocked,
    completed: a.completed != null ? !!a.completed : undefined,
    progress: a.progress,
    targets,
    requirement: a.requirement,
  }
}

function buildEmptyCategories(t) {
  return ACHIEVEMENT_CATEGORY_DEFS.map((def, catIdx) => ({
    id: def.id,
    title: t(`achievementsCatalog.categories.${def.id}.title`),
    description: t(`achievementsCatalog.categories.${def.id}.description`),
    order: catIdx,
    items: [],
  }))
}

function groupBeAchievements(list, t, lng) {
  const buckets = Object.fromEntries(
    ACHIEVEMENT_CATEGORY_DEFS.map((d) => [d.id, []])
  )
  list.forEach((a, idx) => {
    if (!a?.id) return
    if (LEGACY_ACHIEVEMENT_KEYS.has(String(a.key || ''))) return
    const item = beAchievementToItem(a, t, idx, lng)
    const cat = item.categoryId
    if (buckets[cat]) buckets[cat].push(item)
  })
  for (const id of Object.keys(buckets)) {
    buckets[id].sort((x, y) => {
      const o = (x.order ?? 0) - (y.order ?? 0)
      if (o !== 0) return o
      return String(x.key || x.id).localeCompare(String(y.key || y.id))
    })
  }
  return buckets
}

/** Danh sách phẳng (đúng thứ tự danh mục) để dùng ở profile, v.v. */
export function flatAchievementItemsFromApiList(rawList, t, lng) {
  if (!Array.isArray(rawList) || !rawList.length) return []
  const buckets = groupBeAchievements(rawList, t, lng)
  return ACHIEVEMENT_CATEGORY_DEFS.flatMap((d) => buckets[d.id] || [])
}

export function useAchievementsCatalog(t, language) {
  const navigate = useNavigate()

  const [categories, setCategories] = useState(() => buildEmptyCategories(t))

  const [activeCategoryId, setActiveCategoryId] = useState(
    ACHIEVEMENT_CATEGORY_DEFS[0]?.id || 'learning'
  )

  const [categoryOpen, setCategoryOpen] = useState(false)
  const categoryRef = useRef(null)

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeCategoryId) || categories[0],
    [activeCategoryId, categories]
  )

  const addModalSuggestions = useMemo(
    () => getSuggestedAchievementsForCategory(activeCategoryId),
    [activeCategoryId]
  )

  const [activeAchievementId, setActiveAchievementId] = useState(null)

  const achievement = useMemo(() => {
    const list = activeCategory?.items || []
    const aid = activeAchievementId != null ? String(activeAchievementId) : ''
    return list.find((x) => String(x?.id) === aid) || null
  }, [activeAchievementId, activeCategory])

  const [editOpen, setEditOpen] = useState(false)

  const emptyForm = {
    id: '',
    howToVi: '',
    howToEn: '',
    rewards: '',
    rarity: 'common',
    icon: 'emoji_events',
    rewardType: 'both',
    expAmount: '',
    badgeNameVi: '',
    badgeNameEn: '',
    badgeImage: '',
    badgeIcon: '',
    linkLabel: '',
    linkTo: '',
  }

  const createEmptyAchievementForm = () => ({
    ...emptyForm,
    suggestionKey: '',
    targets: [createTargetFormRow()],
  })

  const [editForm, setEditForm] = useState(() => createEmptyAchievementForm())

  const rawBeAchievementsRef = useRef(null)
  const [beTick, setBeTick] = useState(0)

  const fetchBeAchievements = () => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await userService.getAchievements()
        const list =
          res?.data?.data?.achievements ??
          res?.data?.achievements ??
          res?.achievements ??
          []
        if (!Array.isArray(list) || cancelled) return
        rawBeAchievementsRef.current = list
        if (!cancelled) setBeTick((n) => n + 1)
      } catch {
        rawBeAchievementsRef.current = null
      }
    })()
    return () => { cancelled = true }
  }

  useEffect(() => {
    return fetchBeAchievements()
  }, [])

  // Re-fetch when a new achievement is unlocked via socket
  useEffect(() => {
    const handler = () => fetchBeAchievements()
    window.addEventListener('achievement:unlocked', handler)
    return () => window.removeEventListener('achievement:unlocked', handler)
  }, [])

  useEffect(() => {
    const raw = rawBeAchievementsRef.current
    setCategories((prev) =>
      ACHIEVEMENT_CATEGORY_DEFS.map((def, catIdx) => {
        const prevCat = prev.find((c) => c.id === def.id)
        const prevItems = prevCat?.items || []
        const manualOnly = prevItems.filter((x) => !x.key)
        const fromApi =
          raw && Array.isArray(raw)
            ? groupBeAchievements(raw, t, language)[def.id] || []
            : prevItems.filter((x) => x.key)
        return {
          id: def.id,
          title: t(`achievementsCatalog.categories.${def.id}.title`),
          description: t(`achievementsCatalog.categories.${def.id}.description`),
          order: catIdx,
          items: [...manualOnly, ...fromApi],
        }
      })
    )
  }, [t, language, beTick])

  useEffect(() => {
    function onDown(e) {
      if (!categoryOpen) return
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryOpen(false)
      }
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [categoryOpen])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setCategoryOpen(false)
        setEditOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const rewardLinesFromForm = (rewardType, expAmount, badgeName) => {
    const rewardsArr = []
    if (rewardType === 'exp') {
      const n = Number(expAmount || 0)
      if (n > 0) rewardsArr.push(t('achievementsPage.rewardXp', { count: n }))
    } else if (rewardType === 'badge') {
      const bn = (badgeName || '').trim()
      if (bn) rewardsArr.push(t('achievementsPage.rewardBadge', { name: bn }))
    } else if (rewardType === 'both') {
      const n = Number(expAmount || 0)
      const bn = (badgeName || '').trim()
      if (n > 0) rewardsArr.push(t('achievementsPage.rewardXp', { count: n }))
      if (bn) rewardsArr.push(t('achievementsPage.rewardBadge', { name: bn }))
    }
    return rewardsArr
  }

  const selectCategory = (id) => {
    const cat = categories.find((c) => c.id === id) || categories[0]
    setActiveCategoryId(id)
    setActiveAchievementId(cat.items?.[0]?.id || null)
  }

  const openEditForAchievement = (a) => {
    if (!a) return
    const rewardType = a.rewardType || 'both'
    const fromMilestones = targetsFromBeRequirement(a.requirement)
    const rawTargets =
      Array.isArray(a.targets) && a.targets.length > 0
        ? a.targets
        : fromMilestones
    const targetRows =
      rawTargets?.length > 0
        ? rawTargets.map((row) =>
            createTargetFormRow(
              row.labelVi || row.label || '',
              row.labelEn || row.label || '',
              row.value ?? '',
              {
                xpReward: row.xpReward,
                rewardType: row.rewardType || 'exp',
                badgeNameVi: row.badgeNameVi || '',
                badgeNameEn: row.badgeNameEn || '',
                badgeIcon: row.badgeIcon || '',
                badgeImage: row.badgeImage || '',
              }
            )
          )
        : [createTargetFormRow()]

    const bVi =
      typeof a.howToBaseVi === 'string' && a.howToBaseVi.trim()
        ? a.howToBaseVi.trim()
        : null
    const bEn =
      typeof a.howToBaseEn === 'string' && a.howToBaseEn.trim()
        ? a.howToBaseEn.trim()
        : null
    const bLegacy =
      typeof a.howToBase === 'string' && a.howToBase.trim()
        ? a.howToBase.trim()
        : null
    const fall = String(a.howTo || '').trim()
    const howVi = bVi || bLegacy || fall
    const howEn = bEn || bLegacy || fall

    const bn = String(a.badgeName || '').trim()
    const badgeVi =
      a.badgeNameVi != null && String(a.badgeNameVi).trim()
        ? String(a.badgeNameVi).trim()
        : bn
    const badgeEn =
      a.badgeNameEn != null && String(a.badgeNameEn).trim()
        ? String(a.badgeNameEn).trim()
        : bn

    const xp =
      typeof a.expAmount === 'number' && !Number.isNaN(a.expAmount)
        ? a.expAmount
        : Number(a.xpReward ?? 0) || 0

    setEditForm({
      id: a.id,
      howToVi: howVi,
      howToEn: howEn,
      rewards:
        rewardType === 'both' && Array.isArray(a.rewards)
          ? a.rewards.join('\n')
          : '',
      rarity: a.rarity || 'common',
      icon: a.icon || 'emoji_events',
      rewardType,
      expAmount:
        rewardType === 'exp' || rewardType === 'both'
          ? String(xp || '')
          : '',
      badgeNameVi:
        rewardType === 'badge' || rewardType === 'both' ? badgeVi : '',
      badgeNameEn:
        rewardType === 'badge' || rewardType === 'both' ? badgeEn : '',
      badgeImage:
        (rewardType === 'badge' || rewardType === 'both') && a.badgeImage
          ? a.badgeImage
          : '',
      badgeIcon:
        (rewardType === 'badge' || rewardType === 'both') && a.badgeIcon
          ? String(a.badgeIcon)
          : '',
      linkLabel: a.link?.label || '',
      linkTo: a.link?.to || '',
      suggestionKey: a.suggestionKey || (a.key ? String(a.key) : ''),
      targets: targetRows,
    })
    setEditOpen(true)
  }

  const saveEditAchievement = async () => {
    const id = String(editForm.id || '').trim()
    const baseVi = editForm.howToVi.trim()
    const baseEn = editForm.howToEn.trim()
    if (!id || !baseVi || !baseEn) return

    const rows = Array.isArray(editForm.targets) ? editForm.targets : []
    const filled = rows.filter((r) => String(r?.value ?? '').trim() !== '')
    if (!filled.length) return
    for (const r of filled) {
      if (
        !String(r.labelVi || '').trim() ||
        !String(r.labelEn || '').trim()
      ) {
        return
      }
    }
    const nameVi = filled.map((r) => String(r.labelVi || '').trim()).join(' · ')
    const nameEn = filled.map((r) => String(r.labelEn || '').trim()).join(' · ')
    const tVi = i18n.getFixedT('vi')
    const tEn = i18n.getFixedT('en')
    const howToVi = buildHowToWithTargetBlock(baseVi, filled, tVi, 'vi')
    const howToEn = buildHowToWithTargetBlock(baseEn, filled, tEn, 'en')

    const multiMilestones = filled.length >= 2
    const rewardType = editForm.rewardType || 'both'
    const badgeVi = (editForm.badgeNameVi || '').trim()
    const badgeEn = (editForm.badgeNameEn || '').trim()
    if (multiMilestones) {
      for (const r of filled) {
        const rt = r.rewardType || 'exp'
        const xpOk = Number(r.xpReward || 0) > 0
        const bVi = String(r.badgeNameVi || '').trim()
        const bEn = String(r.badgeNameEn || '').trim()
        if (rt === 'exp' && !xpOk) return
        if (rt === 'badge' && (!bVi || !bEn)) return
        if (rt === 'both' && (!xpOk || !bVi || !bEn)) return
      }
    } else {
      if (rewardType === 'badge' || rewardType === 'both') {
        if (!badgeVi || !badgeEn) return
      }
    }
    let rewardsArr
    if (multiMilestones) {
      const activeForDisplay = pickActiveMilestoneRow(
        filled,
        achievement?.progress ?? 0
      )
      rewardsArr = rewardsFromTargetRow(activeForDisplay, t, language)
    } else {
      rewardsArr = rewardLinesFromForm(
        rewardType,
        editForm.expAmount,
        pickLang(badgeVi, badgeEn, language)
      )
    }

    const displayName = pickLang(nameVi, nameEn, language)
    const displayHow = pickLang(howToVi, howToEn, language)

    const milestonePayload = filled.map((r) => ({
      value: Number(String(r.value).replace(',', '.')),
      vi: String(r.labelVi || '').trim(),
      en: String(r.labelEn || '').trim(),
      xpReward: Number(r.xpReward || 0) || 0,
      rewardType: r.rewardType || 'exp',
      badgeName: String(r.badgeNameVi || '').trim(),
      badgeNameEn: String(r.badgeNameEn || '').trim(),
      badgeIcon: String(r.badgeIcon || '').trim() || undefined,
    }))
    const maxMilestoneVal = Math.max(
      0,
      ...milestonePayload.map((m) =>
        Number.isFinite(m.value) ? m.value : 0
      )
    )
    const catalogItem = categories
      .flatMap((c) => c.items || [])
      .find((x) => String(x.id) === String(id))
    const prevReq =
      catalogItem?.requirement ?? achievement?.requirement
    const nextRequirement =
      milestonePayload.length > 0 && prevReq?.type
        ? {
            type: prevReq.type,
            value: maxMilestoneVal || prevReq.value,
            milestones: milestonePayload,
          }
        : prevReq

    const activeForUpdated =
      multiMilestones && filled.length
        ? pickActiveMilestoneRow(filled, achievement?.progress ?? 0)
        : null
    const effRt = multiMilestones
      ? activeForUpdated?.rewardType || 'exp'
      : rewardType
    const effXp =
      multiMilestones && activeForUpdated
        ? Number(activeForUpdated.xpReward || 0) || 0
        : rewardType === 'exp' || rewardType === 'both'
          ? Number(editForm.expAmount || 0) || 0
          : undefined
    const effBadgeVi = multiMilestones
      ? String(activeForUpdated?.badgeNameVi || '').trim()
      : rewardType === 'badge' || rewardType === 'both'
        ? badgeVi
        : ''
    const effBadgeEn = multiMilestones
      ? String(activeForUpdated?.badgeNameEn || '').trim()
      : rewardType === 'badge' || rewardType === 'both'
        ? badgeEn
        : ''
    const effBadgeIcon = multiMilestones
      ? String(activeForUpdated?.badgeIcon || '').trim() || undefined
      : rewardType === 'badge' || rewardType === 'both'
        ? (editForm.badgeIcon || '').trim() || undefined
        : undefined

    const updated = {
      id,
      name: displayName,
      nameVi,
      nameEn,
      icon: editForm.icon?.trim() || 'emoji_events',
      rarity: editForm.rarity || 'common',
      howTo: displayHow,
      howToVi,
      howToEn,
      howToBaseVi: baseVi,
      howToBaseEn: baseEn,
      howToBase: pickLang(baseVi, baseEn, language),
      rewardType: effRt,
      expAmount:
        effRt === 'exp' || effRt === 'both' ? effXp : undefined,
      badgeName: pickLang(effBadgeVi, effBadgeEn, language),
      badgeNameVi:
        effRt === 'badge' || effRt === 'both' ? effBadgeVi : undefined,
      badgeNameEn:
        effRt === 'badge' || effRt === 'both' ? effBadgeEn : undefined,
      badgeImage:
        (effRt === 'badge' || effRt === 'both') && !multiMilestones
          ? (() => {
              const img = editForm.badgeImage
              if (!img || String(img).startsWith('blob:')) return undefined
              return img
            })()
          : undefined,
      badgeIcon: effBadgeIcon,
      rewards: rewardsArr,
      link:
        editForm.linkTo?.trim()
          ? {
              label:
                editForm.linkLabel?.trim() ||
                t('achievementsPage.placeholderLinkLabel'),
              to: editForm.linkTo.trim(),
            }
          : undefined,
      suggestionKey: editForm.suggestionKey?.trim() || undefined,
      targets: filled.map((r) => ({
        labelVi: String(r.labelVi || '').trim(),
        labelEn: String(r.labelEn || '').trim(),
        value: String(r.value ?? '').trim(),
        xpReward: String(r.xpReward ?? ''),
        rewardType: r.rewardType || 'exp',
        badgeNameVi: String(r.badgeNameVi || '').trim(),
        badgeNameEn: String(r.badgeNameEn || '').trim(),
        badgeIcon: String(r.badgeIcon || '').trim(),
      })),
      requirement: nextRequirement,
    }

    try {
      // Prepare payload for backend
      const payload = {
        name: nameVi,
        nameEn: nameEn,
        icon: updated.icon,
        rarity: updated.rarity,
        description: baseVi,
        descriptionEn: baseEn,
        rewardType: updated.rewardType,
        xpReward: updated.expAmount,
        badgeName: updated.badgeNameVi,
        badgeNameEn: updated.badgeNameEn,
        badgeIcon: updated.badgeIcon,
        requirement: updated.requirement,
      }

      await achievementsService.update(id, payload)

      setCategories((prev) =>
        prev.map((c) =>
          c.id === activeCategoryId
            ? {
                ...c,
                items: (c.items || []).map((x) =>
                  x.id === id ? { ...x, ...updated } : x
                ),
              }
            : c
        )
      )
      setActiveAchievementId(id)
      setEditOpen(false)
    } catch (error) {
      console.error('Failed to save achievement:', error)
      alert(t('common.errorSave') || 'Không thể lưu thay đổi.')
    }
  }

  const deleteActiveAchievement = async () => {
    if (!achievement?.id) return
    const ok = window.confirm(t('achievementsPage.confirmDelete'))
    if (!ok) return

    const toDeleteId = achievement.id
    let nextId = null
    const list = activeCategory?.items || []
    const idx = list.findIndex((x) => x.id === toDeleteId)
    if (idx >= 0) {
      nextId = list[idx + 1]?.id || list[idx - 1]?.id || null
    }

    try {
      await achievementsService.delete(toDeleteId)

      setCategories((prev) =>
        prev.map((c) =>
          c.id === activeCategoryId
            ? { ...c, items: (c.items || []).filter((x) => x.id !== toDeleteId) }
            : c
        )
      )
      setActiveAchievementId(nextId)
    } catch (error) {
      console.error('Failed to delete achievement:', error)
      alert(t('common.errorDelete') || 'Không thể xóa thành tích.')
    }
  }

  const goToAchievementLink = (link) => {
    if (!link?.to) return
    const to = String(link.to)
    if (/^https?:\/\//i.test(to)) {
      window.open(to, '_blank', 'noopener,noreferrer')
      return
    }
    navigate(to)
  }

  return {
    categories,
    activeCategoryId,
    activeCategory,
    achievement,
    activeAchievementId,

    categoryOpen,
    setCategoryOpen,
    categoryRef,
    selectCategory,

    setActiveAchievementId,

    addModalSuggestions,

    editOpen,
    setEditOpen,
    editForm,
    setEditForm,
    openEditForAchievement,
    saveEditAchievement,

    deleteActiveAchievement,

    goToAchievementLink,
  }
}
