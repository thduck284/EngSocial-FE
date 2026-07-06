import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lessonsService, practicesService, mockTestService } from '../services'
import { ROUTES, SKILLS } from '../constants'
import { practiceToCard } from '../utils/practice'
import { LEVEL_COLORS } from '../constants/lessons'
import { AlertModal } from '../components/ui/common/AlertModal'

const MANUAL_INITIAL_ROWS = 2
const MANUAL_LOAD_MORE_ROWS = 4

function getPartMinutes(lesson) {
  const raw = lesson?.time ?? lesson?.estimatedTime ?? 15
  const parsed = parseInt(String(raw).replace(/\D/g, ''), 10)
  return parsed > 0 ? parsed : 15
}

export function PracticeMockTestPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [lessons, setLessons] = useState([])
  const [testSets, setTestSets] = useState([]) // Array of { id, lessons }
  const [selectedSet, setSelectedSet] = useState(null)
  const [mockHistory, setMockHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyPage, setHistoryPage] = useState(1)
  const [hasMoreHistory, setHasMoreHistory] = useState(true)

  // Configuration State
  const [mode, setMode] = useState('random') // 'random' | 'manual'
  const [difficulty, setDifficulty] = useState('all')
  const [status, setStatus] = useState('new') // 'new' | 'all'
  const [selectedSkill, setSelectedSkill] = useState('all')
  const [manualSelection, setManualSelection] = useState({
    reading: [],
    listening: [],
    writing: []
  })
  const [manualSearch, setManualSearch] = useState({
    reading: '',
    listening: '',
    writing: ''
  })
  const [showDetail, setShowDetail] = useState(false)
  const [showConfirmStart, setShowConfirmStart] = useState(false)
  const [manualSkillVisibleRows, setManualSkillVisibleRows] = useState({})
  const [manualGridCols, setManualGridCols] = useState(3)

  useEffect(() => {
    const mqXl = window.matchMedia('(min-width: 1280px)')
    const mqSm = window.matchMedia('(min-width: 640px)')
    const updateCols = () => {
      if (mqXl.matches) setManualGridCols(3)
      else if (mqSm.matches) setManualGridCols(2)
      else setManualGridCols(1)
    }
    updateCols()
    mqXl.addEventListener('change', updateCols)
    mqSm.addEventListener('change', updateCols)
    return () => {
      mqXl.removeEventListener('change', updateCols)
      mqSm.removeEventListener('change', updateCols)
    }
  }, [])

  useEffect(() => {
    loadAllLessons()
  }, [selectedSkill])

  useEffect(() => {
    loadMockHistory()
  }, [])

  const loadMockHistory = async () => {
    setLoadingHistory(true)
    try {
      const res = await mockTestService.getUserSessions({ page: 1, limit: 20 })
      const list = Array.isArray(res?.data) ? res.data : []
      setMockHistory(list)
    } catch (error) {
      console.error('Failed to load mock history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleViewSession = (sessionId) => {
    navigate(`/practice/mock-test/result/${sessionId}`)
  }

  const loadAllLessons = async () => {
    setLoading(true)
    try {
      // Fetch practices for different skills
      const fetchSkills = selectedSkill === 'all' ? ['reading', 'listening', 'writing'] : [selectedSkill]

      const allResults = await Promise.all(
        fetchSkills.map(s => practicesService.getPractices({ skill: s, limit: 100 }))
      )

      const combinedLessons = allResults.flatMap(res => {
        const data = Array.isArray(res?.data) ? res.data : res?.data?.data ?? []
        return data.map(l => ({ ...l, skill: l.skill || (allResults.indexOf(res) === 0 ? fetchSkills[0] : allResults.indexOf(res) === 1 ? fetchSkills[1] : fetchSkills[2]) }))
      })

      setLessons(combinedLessons)
    } catch (error) {
      console.error('Failed to load lessons for mock test:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSetBatch = (count = 6, append = false) => {
    setLoading(true)
    const levelWeights = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 }

    let currentSets = append ? [...testSets] : []
    const usedSetsKeys = currentSets.map(s => s.lessons.map(l => l._id || l.id).sort().join(','))

    let newSetsCount = 0
    let attempts = 0

    while (newSetsCount < count && attempts < 30) {
      attempts++
      let result = []
      let canGenerate = true

      if (selectedSkill === 'all') {
        ;['reading', 'listening', 'writing'].forEach(skill => {
          const pool = lessons.filter(l =>
            l.skill === skill &&
            (difficulty === 'all' || l.level === difficulty) &&
            (status === 'all' || !l.isCompleted)
          )
          if (pool.length < 4) {
            canGenerate = false
          } else {
            const shuffled = [...pool].sort(() => Math.random() - 0.5)
            result.push(...shuffled.slice(0, 4))
          }
        })
        if (result.length !== 12) canGenerate = false
      } else {
        const pool = lessons.filter(l => {
          const matchSkill = l.skill === selectedSkill
          const matchDifficulty = difficulty === 'all' || l.level === difficulty
          const matchStatus = status === 'all' || !l.isCompleted
          return matchSkill && matchDifficulty && matchStatus
        })
        if (pool.length < 4) {
          canGenerate = false
        } else {
          const shuffled = [...pool].sort(() => Math.random() - 0.5)
          result.push(...shuffled.slice(0, 4))
        }
      }

      if (canGenerate && result.length > 0) {
        // Sort by Skill (Listening -> Reading -> Writing) then Difficulty (A1 -> C2)
        const skillWeights = { 'listening': 1, 'reading': 2, 'writing': 3 }
        result.sort((a, b) => {
          if (skillWeights[a.skill] !== skillWeights[b.skill]) {
            return skillWeights[a.skill] - skillWeights[b.skill]
          }
          return (levelWeights[a.level] || 0) - (levelWeights[b.level] || 0)
        })

        const setKey = result.map(l => l._id || l.id).sort().join(',')

        if (!usedSetsKeys.includes(setKey)) {
          usedSetsKeys.push(setKey)
          currentSets.push({
            id: `set-${currentSets.length + 1}`,
            title: t('mockTest.testSet', { number: String(currentSets.length + 1).padStart(2, '0') }),
            lessons: result
          })
          newSetsCount++
        }
      }
    }

    setTestSets(currentSets)
    setShowDetail(false)
    setSelectedSet(null)
    setTimeout(() => setLoading(false), 500)
  }

  const handleGenerate = () => generateSetBatch(6, false)
  const handleLoadMore = () => generateSetBatch(6, true)

  const isManualValid = () => {
    if (selectedSkill === 'all') {
      return (manualSelection.reading?.length === 4) &&
        (manualSelection.listening?.length === 4) &&
        (manualSelection.writing?.length === 4)
    }
    return manualSelection[selectedSkill]?.length === 4
  }

  const handleToggleLesson = (lesson) => {
    const skill = lesson.skill
    if (!skill) return
    setManualSelection(prev => {
      const current = prev[skill] || []
      const id = lesson._id || lesson.id
      if (current.includes(id)) {
        return { ...prev, [skill]: current.filter(x => x !== id) }
      } else {
        if (current.length >= 4) return prev
        return { ...prev, [skill]: [...current, id] }
      }
    })
  }

  const handleStartManual = () => {
    const selectedIds = []
    if (selectedSkill === 'all') {
      selectedIds.push(...(manualSelection.reading || []))
      selectedIds.push(...(manualSelection.listening || []))
      selectedIds.push(...(manualSelection.writing || []))
    } else {
      selectedIds.push(...(manualSelection[selectedSkill] || []))
    }

    if (selectedIds.length > 0) {
      const selectedLessons = lessons.filter(l => selectedIds.includes(l._id || l.id))

      setSelectedSet({
        id: 'manual-set',
        title: t('mockTest.manualSelection'),
        lessons: selectedLessons
      })
      setShowDetail(true)
    }
  }

  const handleStartFinal = () => {
    setShowConfirmStart(false)
    if (!selectedSet) return

    const totalDurationSec = selectedSet.lessons.reduce((acc, l) => {
      const t = l.time || l.estimatedTime || 15
      const mins = parseInt(t, 10) || 15
      return acc + (mins * 60)
    }, 0)

    const mockTestData = {
      lessons: selectedSet.lessons.map(l => ({
        id: l._id || l.id,
        title: l.title,
        skill: l.skill,
        totalQuestions: l.totalQuestions || 0
      })),
      startTime: Date.now(),
      totalDurationSec,
      activeLessonId: selectedSet.lessons[0]?._id || selectedSet.lessons[0]?.id,
      partStartedAt: {},
      partTimeSpent: {},
    }
    const firstId = mockTestData.activeLessonId
    if (firstId) mockTestData.partStartedAt[firstId] = Date.now()
    localStorage.setItem('engsocial_mock_test', JSON.stringify(mockTestData))
    localStorage.removeItem('engsocial_mock_test_answers')
    const first = selectedSet.lessons[0]
    navigate(`/practice/${first.skill}/${first._id || first.id}/study`)
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 pt-2 pb-8">
      <div className="grid grid-cols-12 gap-8">

        {/* LEFT BAR: Info & Tips */}
        <aside className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-4 self-start h-fit">
          <div className="bg-white dark:bg-card-dark rounded-3xl p-6 border border-slate-200 dark:border-border-dark shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2 uppercase tracking-widest">
              <span className="material-symbols-outlined text-primary text-xl">info</span>
              {t('mockTest.howItWorks')}
            </h3>
            <ul className="space-y-5">
              <li className="flex gap-4">
                <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black text-xs">1</span>
                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed font-medium">{t('mockTest.step1')}</p>
              </li>
              <li className="flex gap-4">
                <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black text-xs">2</span>
                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed font-medium">{t('mockTest.step2')}</p>
              </li>
              <li className="flex gap-4">
                <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black text-xs">3</span>
                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed font-medium">{t('mockTest.step3')}</p>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-transparent dark:from-primary/20 rounded-3xl p-6 border border-primary/20 relative overflow-hidden group">
            <h4 className="font-black text-xs text-primary dark:text-white mb-3 flex items-center gap-2 uppercase tracking-widest">
              <span className="material-symbols-outlined text-yellow-500 fill-icon">emoji_events</span>
              {t('mockTest.proTip')}
            </h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed italic font-medium relative z-10">
              {t('mockTest.tipText')}
            </p>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-primary/10 text-6xl rotate-12 group-hover:scale-110 transition-transform">lightbulb</span>
          </div>
        </aside>


        {/* MAIN CONTENT: Generator & Results */}
        <main className="col-span-12 lg:col-span-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              {t('skills.mockTest')}
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-gray-400 max-w-lg">{t('mockTest.desc')}</p>
          </div>

          {/* Configuration Card */}
          <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="space-y-10">

              {/* Skill Selection Grid with All Skills Option */}
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 flex items-center gap-2 px-1">
                  <span className="material-symbols-outlined text-sm text-primary">psychology</span>
                  {t('mockTest.targetSkill') || 'Target Skill'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* All Skills Option */}
                  <button
                    onClick={() => setSelectedSkill('all')}
                    className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300 ${selectedSkill === 'all'
                        ? 'bg-primary/10 border-primary text-primary shadow-xl shadow-primary/10 scale-[1.02]'
                        : 'bg-slate-50 dark:bg-background-dark/50 border-transparent text-slate-400 dark:text-gray-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/10'
                      }`}
                  >
                    <span className="material-symbols-outlined text-3xl font-light">grid_view</span>
                    <span className="text-[10px] font-black uppercase tracking-wider truncate">{t('mockTest.allSkills')}</span>
                  </button>

                  {Object.entries(SKILLS).map(([key, { icon, label }]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedSkill(key)}
                      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300 ${selectedSkill === key
                          ? 'bg-primary/10 border-primary text-primary shadow-xl shadow-primary/10 scale-[1.02]'
                          : 'bg-slate-50 dark:bg-background-dark/50 border-transparent text-slate-400 dark:text-gray-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/10'
                        }`}
                    >
                      <span className="material-symbols-outlined text-3xl font-light">{icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider truncate">{t(label)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Mode Select (Type) */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 flex items-center gap-2 px-1">
                    <span className="material-symbols-outlined text-sm text-primary">shuffle</span>
                    {t('mockTest.selectionType') || 'Type'}
                  </label>
                  <div className="relative group">
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark hover:border-primary/50 text-sm rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 outline-none appearance-none transition-all cursor-pointer font-black shadow-sm"
                    >
                      <option value="random">{t('mockTest.random')}</option>
                      <option value="manual">{t('mockTest.manual')}</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary transition-colors">unfold_more</span>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 flex items-center gap-2 px-1">
                    <span className="material-symbols-outlined text-sm text-primary">leaderboard</span>
                    {t('skills.filterLevel')}
                  </label>
                  <div className="relative group">
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      disabled={mode === 'manual'}
                      className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark hover:border-primary/50 text-sm rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 outline-none appearance-none transition-all cursor-pointer font-black shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="all">{t('skills.filterAll')}</option>
                      <option value="A1">{t('mockTest.levels.A1')}</option>
                      <option value="A2">{t('mockTest.levels.A2')}</option>
                      <option value="B1">{t('mockTest.levels.B1')}</option>
                      <option value="B2">{t('mockTest.levels.B2')}</option>
                      <option value="C1">{t('mockTest.levels.C1')}</option>
                      <option value="C2">{t('mockTest.levels.C2')}</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary transition-colors">unfold_more</span>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 flex items-center gap-2 px-1">
                    <span className="material-symbols-outlined text-sm text-primary">history_edu</span>
                    {t('mockTest.historyStatus') || 'History Status'}
                  </label>
                  <div className="relative group">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={mode === 'manual'}
                      className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark hover:border-primary/50 text-sm rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 outline-none appearance-none transition-all cursor-pointer font-black shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="new">{t('mockTest.filterNew')}</option>
                      <option value="all">{t('mockTest.filterAll')}</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary transition-colors">unfold_more</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={mode === 'manual' ? handleStartManual : handleGenerate}
              disabled={loading || (mode === 'manual' && !isManualValid())}
              className="w-full mt-8 py-3 bg-primary hover:brightness-110 text-white font-black rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:active:scale-100 uppercase tracking-widest text-[11px]"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base group-hover:rotate-12 transition-transform">
                    {mode === 'manual' ? 'visibility' : 'bolt'}
                  </span>
                  {mode === 'manual' ? (t('mockTest.viewDetails') || 'Xem chi tiết') : (t('mockTest.generateBtn') || 'Tạo đề thi ngay')}
                </>
              )}
            </button>
          </div>


          {/* RESULTS AREA for Random Mode */}
          {mode === 'random' && (
            <div className="space-y-6">
              {testSets.length > 0 ? (
                showDetail && selectedSet ? (
                  /* DETAIL VIEW MODE */
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowDetail(false)}
                        className="size-9 flex items-center justify-center bg-white dark:bg-card-dark hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg border border-slate-200 dark:border-border-dark transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-slate-500 dark:text-gray-400 text-lg">arrow_back</span>
                      </button>
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {selectedSet.title}
                        </h2>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                          {t('mockTest.detailTitle')}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-md shadow-slate-100 dark:shadow-none">
                      <div className="p-4 md:p-5 border-b border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-primary/5">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center rounded-lg bg-white dark:bg-card-dark p-3 border border-slate-100 dark:border-white/5">
                            <div className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1">
                              {t('mockTest.totalParts')}
                            </div>
                            <div className="text-xl font-bold text-slate-900 dark:text-white">{selectedSet.lessons.length}</div>
                          </div>
                          <div className="text-center rounded-lg bg-white dark:bg-card-dark p-3 border border-slate-100 dark:border-white/5">
                            <div className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1">
                              {t('mockTest.estimatedTime')}
                            </div>
                            <div className="text-xl font-bold text-primary">
                              {selectedSet.lessons.reduce((acc, l) => acc + getPartMinutes(l), 0)} {t('common.minutesShort')}
                            </div>
                          </div>
                          <div className="text-center rounded-lg bg-white dark:bg-card-dark p-3 border border-slate-100 dark:border-white/5">
                            <div className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1">
                              {t('mockTest.targetLevel')}
                            </div>
                            <div className="text-xl font-bold text-emerald-500 dark:text-emerald-400">
                              {difficulty === 'all' ? t('mockTest.levelMix') : difficulty}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-border-dark">
                        {selectedSet.lessons.map((item, idx) => {
                          const skillInfo = SKILLS[item.skill] || {}
                          const partMinutes = getPartMinutes(item)
                          const levelColor = LEVEL_COLORS[item.level] || 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-gray-300'
                          const description = item.description || item.desc || ''

                          return (
                            <article
                              key={item._id || item.id || idx}
                              className="p-4 md:p-5 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                                <div className="flex sm:flex-col items-center sm:justify-center gap-2 sm:gap-1 shrink-0 sm:w-14 text-center">
                                  <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                                    {t('mockTest.tablePart')}
                                  </span>
                                  <span className="text-base font-bold text-slate-800 dark:text-white tabular-nums">
                                    #{String(idx + 1).padStart(2, '0')}
                                  </span>
                                </div>

                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                                      <span className="material-symbols-outlined text-sm">{skillInfo.icon}</span>
                                      {t(`skills.${item.skill}`)}
                                    </span>
                                    {item.level ? (
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${levelColor}`}>
                                        {item.level}
                                      </span>
                                    ) : null}
                                    <span className="sm:hidden ml-auto text-xs font-medium text-slate-500 dark:text-gray-400 tabular-nums">
                                      {partMinutes} {t('common.minutesShort')}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                                    {item.title}
                                  </h4>
                                  {description ? (
                                    <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                                      {description}
                                    </p>
                                  ) : null}
                                </div>

                                <div className="hidden sm:flex shrink-0 flex-col items-end justify-center min-w-[80px] pl-2">
                                  <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
                                    {t('mockTest.tableDuration')}
                                  </span>
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tabular-nums whitespace-nowrap">
                                    {partMinutes} {t('common.minutesShort')}
                                  </span>
                                </div>
                              </div>
                            </article>
                          )
                        })}
                      </div>

                      <div className="p-4 md:p-5 bg-slate-50 dark:bg-background-dark/50 border-t border-slate-100 dark:border-border-dark">
                        <button
                          type="button"
                          onClick={() => setShowConfirmStart(true)}
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider active:scale-[0.98]"
                        >
                          <span className="material-symbols-outlined text-xl">play_circle</span>
                          {t('mockTest.startTest') || 'Bắt đầu bài thi'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* SETS LIST VIEW MODE */
                  <div className="space-y-8">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-widest">
                      <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">diversity_1</span>
                      {t('mockTest.generatedSets') || 'Đề thi gợi ý cho bạn'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                      {testSets.map((set) => {
                        const totalMinutes = set.lessons.reduce((acc, l) => acc + getPartMinutes(l), 0)
                        return (
                        <div
                          key={set.id}
                          className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark p-5 hover:border-primary/40 transition-all group flex flex-col shadow-sm hover:shadow-md"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-3 mb-4">
                              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-xl text-primary">quiz</span>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="bg-slate-50 dark:bg-background-dark px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/5 text-[9px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                                  {set.lessons.length} {t('mockTest.parts')}
                                </span>
                                <span className="text-[9px] font-medium text-slate-400 dark:text-gray-500 tabular-nums">
                                  ~{totalMinutes} {t('common.minutesShort')}
                                </span>
                              </div>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug">
                              {set.title}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 mt-2 uppercase tracking-wider">
                              {selectedSkill === 'all' ? t('mockTest.allSkills') : t(`skills.${selectedSkill}`)} • {t('skills.filterLevel')} {difficulty}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSet(set)
                              setShowDetail(true)
                            }}
                            className="w-full py-2 mt-4 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/5 hover:border-primary/50 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 group-hover:text-primary transition-all"
                          >
                            {t('mockTest.viewDetails') || 'Xem chi tiết'}
                          </button>
                        </div>
                        )
                      })}
                    </div>

                    {testSets.length > 0 && testSets.length < 30 && (
                      <div className="flex justify-center pb-20">
                        <button
                          onClick={handleLoadMore}
                          disabled={loading}
                          className="px-12 py-4 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-primary/50 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-400 hover:text-primary transition-all flex items-center gap-3 shadow-xl hover:shadow-primary/10 group active:scale-95"
                        >
                          {loading ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                          ) : (
                            <>
                              <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">add_circle</span>
                              {t('common.showMore') || 'Xem thêm đề thi'}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )
              ) : (
                /* EMPTY STATE */
                <div className="bg-slate-50/50 dark:bg-background-dark/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-border-dark py-32 flex flex-col items-center justify-center text-center px-10 shadow-inner">
                  <div className="size-24 bg-white dark:bg-card-dark rounded-full flex items-center justify-center mb-8 shadow-xl border border-slate-100 dark:border-white/5">
                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-gray-600">quiz</span>
                  </div>
                  <h3 className="text-slate-900 dark:text-white text-xl font-black mb-3 uppercase tracking-tight">{t('mockTest.emptyStateTitle') || 'Bạn đã sẵn sàng thử thách?'}</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-500 max-w-sm font-medium leading-relaxed italic">{t('mockTest.emptyStateDesc') || 'Tùy chỉnh tiêu chí của bạn ở trên và nhấp vào "Tạo đề thi ngay" để tìm bộ bài tập tốt nhất cho bạn.'}</p>
                </div>
              )}
            </div>
          )}


          {/* MANUAL SELECTION AREA */}
          {mode === 'manual' && (
            <div className="space-y-8 pb-12">
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-primary text-lg">touch_app</span>
                  {t('mockTest.manualSelection')}
                </h2>
                <div className="p-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                    <span className="text-primary font-bold uppercase tracking-wider mr-1.5">{t('mockTest.noteLabel')}</span>
                    {t('mockTest.manualSelectionHint')}
                  </p>
                </div>
              </div>

              {(selectedSkill === 'all' ? ['reading', 'listening', 'writing'] : [selectedSkill]).map(skillKey => {
                const skillLessons = lessons.filter(l => l.skill === skillKey)
                const filtered = skillLessons.filter(l =>
                  l.title?.toLowerCase().includes(manualSearch[skillKey]?.toLowerCase() || '')
                )
                const skillInfo = SKILLS[skillKey] || {}
                const visibleRows = manualSkillVisibleRows[skillKey] ?? MANUAL_INITIAL_ROWS
                const visibleCount = Math.min(filtered.length, manualGridCols * visibleRows)
                const visibleLessons = filtered.slice(0, visibleCount)
                const hasMoreLessons = visibleCount < filtered.length
                const canCollapse = visibleRows > MANUAL_INITIAL_ROWS
                const nextLoadCount = Math.min(
                  filtered.length - visibleCount,
                  manualGridCols * MANUAL_LOAD_MORE_ROWS,
                )

                return (
                  <div key={skillKey} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-border-dark pb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`size-9 rounded-lg ${skillInfo.color?.replace('text-', 'bg-') || 'bg-primary'}/10 flex items-center justify-center shrink-0`}>
                          <span className={`material-symbols-outlined text-lg ${skillInfo.color || 'text-primary'}`}>
                            {skillInfo.icon}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            {t(skillInfo.label)}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                            {manualSelection[skillKey]?.length || 0}/4 {t('mockTest.selected')}
                          </p>
                        </div>
                      </div>

                      <div className="relative group w-full sm:w-64 shrink-0">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base group-focus-within:text-primary transition-colors">search</span>
                        <input
                          type="text"
                          value={manualSearch[skillKey] || ''}
                          onChange={(e) => {
                            setManualSearch(prev => ({ ...prev, [skillKey]: e.target.value }))
                            setManualSkillVisibleRows(prev => ({ ...prev, [skillKey]: MANUAL_INITIAL_ROWS }))
                          }}
                          placeholder={`${t('dashboard.quickSearch')} ${t(skillInfo.label)}...`}
                          className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/5 focus:border-primary/50 text-xs font-medium rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-white outline-none transition-all focus:ring-2 focus:ring-primary/10"
                        />
                      </div>
                    </div>

                    {filtered.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                          {visibleLessons.map((l) => {
                          const item = { ...l, ...practiceToCard(l, skillKey) }
                          const itemId = item.id || item._id
                          const isSelected = manualSelection[skillKey]?.includes(itemId)
                          const partMinutes = getPartMinutes(item)

                          return (
                            <button
                              key={itemId}
                              type="button"
                              onClick={() => handleToggleLesson(l)}
                              className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all relative ${
                                isSelected
                                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                  : 'border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark hover:border-primary/40'
                              }`}
                            >
                              <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-background-dark relative">
                                {item.img ? (
                                  <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url('${item.img}')` }}
                                  />
                                ) : (
                                  <div className={`absolute inset-0 flex items-center justify-center ${skillInfo.color?.replace('text-', 'bg-') || 'bg-primary'}/10`}>
                                    <span className={`material-symbols-outlined text-xl ${skillInfo.color || 'text-primary'}`}>
                                      {skillInfo.icon}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0 pr-6">
                                <div className="flex items-start gap-2 mb-1">
                                  <h4 className={`text-xs font-bold leading-snug line-clamp-2 flex-1 ${isSelected ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                                    {item.title}
                                  </h4>
                                  {item.level ? (
                                    <span className={`px-1.5 py-0.5 ${item.levelColor || 'bg-slate-100 text-slate-600'} text-[8px] font-bold rounded shrink-0 uppercase`}>
                                      {item.level}
                                    </span>
                                  ) : null}
                                </div>
                                {item.topic ? (
                                  <p className="text-[10px] text-slate-500 dark:text-gray-400 line-clamp-1 mb-1.5 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[10px] shrink-0">category</span>
                                    <span className="truncate">{item.topic}</span>
                                  </p>
                                ) : null}
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] text-slate-400 dark:text-gray-500 tabular-nums">
                                    {partMinutes} {t('common.minutesShort')}
                                  </span>
                                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-primary' : 'text-slate-400 dark:text-gray-500'}`}>
                                    {isSelected ? t('buttons.selected') : t('buttons.select')}
                                  </span>
                                </div>
                              </div>

                              {isSelected ? (
                                <span className="absolute top-2 right-2 size-5 bg-primary rounded-full flex items-center justify-center text-white">
                                  <span className="material-symbols-outlined text-xs">check</span>
                                </span>
                              ) : null}
                            </button>
                          )
                        })}
                        </div>
                        {hasMoreLessons || canCollapse ? (
                          <div className="flex justify-center gap-2 pt-1">
                            {hasMoreLessons ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setManualSkillVisibleRows((prev) => ({
                                    ...prev,
                                    [skillKey]: visibleRows + MANUAL_LOAD_MORE_ROWS,
                                  }))
                                }
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 hover:text-primary hover:border-primary/40 transition-all"
                              >
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                                {`${t('common.showMore')} (${nextLoadCount})`}
                              </button>
                            ) : null}
                            {canCollapse ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setManualSkillVisibleRows((prev) => ({
                                    ...prev,
                                    [skillKey]: MANUAL_INITIAL_ROWS,
                                  }))
                                }
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 hover:text-primary hover:border-primary/40 transition-all"
                              >
                                <span className="material-symbols-outlined text-sm">expand_less</span>
                                {t('common.showLess')}
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="py-10 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-background-dark/30 rounded-xl border border-dashed border-slate-200 dark:border-border-dark">
                        <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-gray-600 mb-2">search_off</span>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">{t('mockTest.noLessonsData')}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </main>


        {/* RIGHT BAR: History & Stats */}
        <aside className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-4 self-start h-fit">
          <div className="bg-white dark:bg-card-dark rounded-3xl p-6 border border-slate-200 dark:border-border-dark space-y-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl text-lg">history</span>
              {t('manageLessons.tabMockTests')}
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
              {loadingHistory ? (
                <div className="flex justify-center py-6">
                  <span className="material-symbols-outlined animate-spin text-primary text-2xl">progress_activity</span>
                </div>
              ) : mockHistory.length > 0 ? (
                mockHistory.map((item) => (
                  <div 
                    key={item._id || item.id} 
                    onClick={() => handleViewSession(item._id || item.id)}
                    className="p-4 bg-slate-50 dark:bg-background-dark/50 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${item.status === 'graded' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                        {item.status === 'graded' ? t('manageLessons.statusGraded') : t('manageLessons.statusNotGraded')}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-tight">
                        {new Date(item.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm font-black text-slate-800 dark:text-white group-hover:text-primary transition-colors truncate mb-3">
                      {item.title || `${t('skills.mockTest')} #${(item._id || item.id || '').slice(-4)}`}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                      <div className="text-[10px] text-slate-500 dark:text-gray-400 font-black uppercase tracking-widest">
                        {item.overallScore}/{item.maxTotalScore} <span className="text-slate-300 dark:text-gray-600 mx-1">Pts</span>
                      </div>
                      <div className="text-xs font-black text-primary">
                        {Math.round((item.overallScore / (item.maxTotalScore || 1)) * 100)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 space-y-4 bg-slate-50 dark:bg-background-dark/30 rounded-2xl border border-dashed border-slate-200 dark:border-border-dark">
                  <span className="material-symbols-outlined text-slate-300 dark:text-gray-700 text-4xl">history</span>
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest">{t('mockTest.noHistory') || 'Chưa có lịch sử thi'}</p>
                </div>
              )}
            </div>

          </div>
        </aside>


      </div>

      <AlertModal
        open={showConfirmStart}
        onClose={() => setShowConfirmStart(false)}
        onConfirm={handleStartFinal}
        title={t('mockTest.confirmStartTitle') || 'Confirm Start'}
        message={t('mockTest.confirmStartMessage') || 'Are you sure you want to start the mock test? Your time will start counting down immediately.'}
        confirmText={t('mockTest.startNow')}
        cancelText={t('common.cancel')}
        type="warning"
      />
    </div>
  )
}
