import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { questsService } from '../services'
import { ROUTES } from '../constants'

const defaultForm = () => ({
  title: '',
  description: '',
  type: 'daily',
  targetType: 'lesson',
  targetValue: 1,
  xpReward: 50,
  icon: 'flag',
  skill: 'all',
  status: 'active',
  order: 0,
})

/**
 * Hook for Manage Quest page (add/edit): form state, load quest by id, save.
 * @param {string} id - Quest ID from route (undefined when adding)
 * @param {Function} t - i18n t function
 * @returns {Object} form, setForm, error, loading, loadingQuest, isEdit, save
 */
export function useManageQuestForm(id, t) {
  const navigate = useNavigate()
  const isEdit = !!id
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingQuest, setLoadingQuest] = useState(isEdit)

  useEffect(() => {
    if (!id) return
    setLoadingQuest(true)
    questsService
      .getById(id)
      .then((res) => {
        const data = res?.data
        if (data) {
          setForm({
            title: data.title ?? '',
            description: data.description ?? '',
            type: data.type ?? 'daily',
            targetType: data.targetType ?? 'lesson',
            targetValue: data.targetValue ?? 1,
            xpReward: data.xpReward ?? 50,
            icon: data.icon ?? 'flag',
            skill: data.skill ?? 'all',
            status: data.status ?? 'active',
            order: data.order ?? 0,
          })
        }
      })
      .catch(() => setError(t('manageQuests.loadQuestFailed')))
      .finally(() => setLoadingQuest(false))
  }, [id, t])

  const save = async () => {
    if (!form?.title?.trim()) return
    setError('')
    setLoading(true)
    try {
      if (isEdit) {
        await questsService.update(id, form)
      } else {
        await questsService.create(form)
      }
      navigate(ROUTES.QUESTS)
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
