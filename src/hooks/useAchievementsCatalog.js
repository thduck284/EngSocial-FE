import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ACHIEVEMENT_CATEGORIES_VI } from '../constants/achievementsCatalog.vi'

export function useAchievementsCatalog() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState(ACHIEVEMENT_CATEGORIES_VI)
  const [activeCategoryId, setActiveCategoryId] = useState(
    ACHIEVEMENT_CATEGORIES_VI[0]?.id || 'learning'
  )

  const [categoryOpen, setCategoryOpen] = useState(false)
  const categoryRef = useRef(null)

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeCategoryId) || categories[0],
    [activeCategoryId, categories]
  )

  const [activeAchievementId, setActiveAchievementId] = useState(
    activeCategory?.items?.[0]?.id || null
  )

  const achievement = useMemo(() => {
    const list = activeCategory?.items || []
    return list.find((x) => x.id === activeAchievementId) || list[0] || null
  }, [activeAchievementId, activeCategory])

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const emptyForm = {
    id: '',
    name: '',
    howTo: '',
    rewards: '',
    rarity: 'common',
    icon: 'emoji_events',
    rewardType: 'both',
    expAmount: '',
    badgeName: '',
    badgeImage: '',
    linkLabel: '',
    linkTo: '',
  }

  const [addForm, setAddForm] = useState({ ...emptyForm })
  const [editForm, setEditForm] = useState({ ...emptyForm })

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
        setAddOpen(false)
        setEditOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const createId = (base) =>
    String(base || 'achievement')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `achievement-${Date.now()}`

  const selectCategory = (id) => {
    const cat = categories.find((c) => c.id === id) || categories[0]
    setActiveCategoryId(id)
    setActiveAchievementId(cat.items?.[0]?.id || null)
  }

  const addAchievementToActiveCategory = () => {
    const name = addForm.name.trim()
    const howTo = addForm.howTo.trim()
    if (!name || !howTo) return

    const rewardType = addForm.rewardType || 'both'

    let rewardsArr = []
    if (rewardType === 'exp') {
      const n = Number(addForm.expAmount || 0)
      if (n > 0) rewardsArr.push(`Nhận ${n} EXP`)
    } else if (rewardType === 'badge') {
      const badgeName = (addForm.badgeName || '').trim()
      if (badgeName) rewardsArr.push(`Nhận được huy hiệu ${badgeName}`)
    } else if (rewardType === 'both') {
      const n = Number(addForm.expAmount || 0)
      const badgeName = (addForm.badgeName || '').trim()
      if (n > 0) rewardsArr.push(`Nhận ${n} EXP`)
      if (badgeName) rewardsArr.push(`Nhận được huy hiệu ${badgeName}`)
    }

    const newItem = {
      id: createId(name),
      name,
      icon: addForm.icon?.trim() || 'emoji_events',
      rarity: addForm.rarity || 'common',
      howTo,
      rewardType,
      expAmount:
        rewardType === 'exp' || rewardType === 'both'
          ? Number(addForm.expAmount || 0) || 0
          : undefined,
      badgeName:
        rewardType === 'badge' || rewardType === 'both'
          ? (addForm.badgeName || '').trim() || undefined
          : undefined,
      badgeImage:
        rewardType === 'badge' || rewardType === 'both'
          ? addForm.badgeImage || undefined
          : undefined,
      rewards: rewardsArr,
      link:
        addForm.linkTo?.trim()
          ? {
              label: addForm.linkLabel?.trim() || 'Đi tới',
              to: addForm.linkTo.trim(),
            }
          : undefined,
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id === activeCategoryId
          ? { ...c, items: [newItem, ...(c.items || [])] }
          : c
      )
    )
    setActiveAchievementId(newItem.id)
    setAddOpen(false)
    setAddForm({ ...emptyForm })
  }

  const openEditForAchievement = (a) => {
    if (!a) return
    const rewardType = a.rewardType || 'both'
    setEditForm({
      id: a.id,
      name: a.name || '',
      howTo: a.howTo || '',
      rewards:
        rewardType === 'both' && Array.isArray(a.rewards)
          ? a.rewards.join('\n')
          : '',
      rarity: a.rarity || 'common',
      icon: a.icon || 'emoji_events',
      rewardType,
      expAmount:
        (rewardType === 'exp' || rewardType === 'both') &&
        typeof a.expAmount === 'number'
          ? String(a.expAmount)
          : '',
      badgeName:
        (rewardType === 'badge' || rewardType === 'both') && a.badgeName
          ? String(a.badgeName)
          : '',
      badgeImage:
        (rewardType === 'badge' || rewardType === 'both') && a.badgeImage
          ? a.badgeImage
          : '',
      linkLabel: a.link?.label || '',
      linkTo: a.link?.to || '',
    })
    setEditOpen(true)
  }

  const saveEditAchievement = () => {
    const id = String(editForm.id || '').trim()
    const name = editForm.name.trim()
    const howTo = editForm.howTo.trim()
    if (!id || !name || !howTo) return

    const rewardType = editForm.rewardType || 'both'

    let rewardsArr = []
    if (rewardType === 'exp') {
      const n = Number(editForm.expAmount || 0)
      if (n > 0) rewardsArr.push(`Nhận ${n} EXP`)
    } else if (rewardType === 'badge') {
      const badgeName = (editForm.badgeName || '').trim()
      if (badgeName) rewardsArr.push(`Nhận được huy hiệu ${badgeName}`)
    } else if (rewardType === 'both') {
      const n = Number(editForm.expAmount || 0)
      const badgeName = (editForm.badgeName || '').trim()
      if (n > 0) rewardsArr.push(`Nhận ${n} EXP`)
      if (badgeName) rewardsArr.push(`Nhận được huy hiệu ${badgeName}`)
    }

    const updated = {
      id,
      name,
      icon: editForm.icon?.trim() || 'emoji_events',
      rarity: editForm.rarity || 'common',
      howTo,
      rewardType,
      expAmount:
        rewardType === 'exp' || rewardType === 'both'
          ? Number(editForm.expAmount || 0) || 0
          : undefined,
      badgeName:
        rewardType === 'badge' || rewardType === 'both'
          ? (editForm.badgeName || '').trim() || undefined
          : undefined,
      badgeImage:
        rewardType === 'badge' || rewardType === 'both'
          ? editForm.badgeImage || undefined
          : undefined,
      rewards: rewardsArr,
      link:
        editForm.linkTo?.trim()
          ? {
              label: editForm.linkLabel?.trim() || 'Đi tới',
              to: editForm.linkTo.trim(),
            }
          : undefined,
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id === activeCategoryId
          ? {
              ...c,
              items: (c.items || []).map((x) => (x.id === id ? updated : x)),
            }
          : c
      )
    )
    setActiveAchievementId(id)
    setEditOpen(false)
  }

  const deleteActiveAchievement = () => {
    if (!achievement?.id) return
    const ok = window.confirm('Xóa achievement này?')
    if (!ok) return

    const toDeleteId = achievement.id
    let nextId = null
    const list = activeCategory?.items || []
    const idx = list.findIndex((x) => x.id === toDeleteId)
    if (idx >= 0) {
      nextId = list[idx + 1]?.id || list[idx - 1]?.id || null
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id === activeCategoryId
          ? { ...c, items: (c.items || []).filter((x) => x.id !== toDeleteId) }
          : c
      )
    )
    setActiveAchievementId(nextId)
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
    // data
    categories,
    activeCategoryId,
    activeCategory,
    achievement,
    activeAchievementId,

    // category dropdown
    categoryOpen,
    setCategoryOpen,
    categoryRef,
    selectCategory,

    // selection
    setActiveAchievementId,

    // add
    addOpen,
    setAddOpen,
    addForm,
    setAddForm,
    addAchievementToActiveCategory,

    // edit
    editOpen,
    setEditOpen,
    editForm,
    setEditForm,
    openEditForAchievement,
    saveEditAchievement,

    // delete
    deleteActiveAchievement,

    // redirect
    goToAchievementLink,
  }
}

