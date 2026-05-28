import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { questsService } from '../services'
import { ROUTES } from '../constants'

const defaultForm = () => ({
  type: 'daily',
  condition: {
    targetMin: 1,
    targetMax: 1,
    filters: {
      skill: 'all',
      category: 'lesson',
      minScorePercent: 0,
    },
  },
  xpReward: 50,
  icon: 'flag',
  status: 'active',
})

/**
 * Form thêm/sửa mẫu PeriodicQuestPool (staff /mod/.../quests).
 * @param {string} [id] - poolId khi sửa (route quests/:id)
 * @param {Function} t - i18n t
 */
export function useManageQuestForm(id, t) {
  const navigate = useNavigate()
  const { userId } = useParams()
  const isEdit = !!id
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingQuest, setLoadingQuest] = useState(isEdit)

  useEffect(() => {
    if (!id) {
      setForm(defaultForm())
      setLoadingQuest(false)
      return
    }
    setLoadingQuest(true)
    questsService
      .getPoolById(id)
      .then((res) => {
        const data = res?.data
        if (!data) return
        setForm({
          type: data.periodType || 'daily',
          condition: {
            targetMin: data.targetMin ?? 1,
            targetMax: data.targetMax ?? data.targetMin ?? 1,
            filters: {
              skill: data.skill ?? 'all',
              category: data.category ?? 'lesson',
              minScorePercent: data.minScorePercent ?? 0,
            },
          },
          xpReward: data.xpReward ?? 50,
          icon: data.icon ?? 'flag',
          status: data.status ?? 'active',
        })
      })
      .catch(() => setError(t('manageQuests.loadQuestFailed')))
      .finally(() => setLoadingQuest(false))
  }, [id, t])

  const save = async () => {
    const cat = form.condition?.filters?.category
    if (!cat) {
      setError(t('manageQuests.poolSaveNeedCategory'))
      return
    }
    const tMin = form.condition?.targetMin ?? 1
    const tMax = form.condition?.targetMax ?? tMin
    if (tMin < 1 || tMax < 1 || tMax < tMin) {
      setError(t('manageQuests.poolSaveInvalidTarget'))
      return
    }
    setError('')
    setLoading(true)
    const body = {
      periodType: form.type,
      condition: form.condition,
      xpReward: form.xpReward,
      icon: form.icon,
      status: form.status,
    }
    try {
      if (isEdit) await questsService.updatePool(id, body)
      else await questsService.createPool(body)
      if (userId != null && userId !== '') navigate(ROUTES.MANAGE_QUESTS(userId))
      else navigate(ROUTES.QUESTS)
    } catch (e) {
      setError(e.message || t('manageQuests.saveFailed'))
    } finally {
      setLoading(false)
    }
  }

  return {
    form,
    setForm,
    error,
    loading,
    loadingQuest,
    isEdit,
    save,
  }
}
