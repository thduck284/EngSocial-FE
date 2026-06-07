import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lessonsService, practicesService, mockTestService } from '../services'
import { ROUTES, SKILLS } from '../constants'
import { practiceToCard } from '../utils/practice'
import { LEVEL_COLORS } from '../constants/lessons'
import { AlertModal } from '../components/ui/common/AlertModal'

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
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setShowDetail(false)}
                        className="size-10 flex items-center justify-center bg-white dark:bg-card-dark hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl border border-slate-200 dark:border-border-dark transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-slate-500 dark:text-gray-400">arrow_back</span>
                      </button>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {selectedSet.title} <span className="text-slate-400 dark:text-gray-500 font-medium ml-2">- {t('mockTest.detailTitle') || 'Details'}</span>
                      </h2>
                    </div>

                    <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
                      <div className="p-10 border-b border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-primary/5">
                        <div className="grid grid-cols-3 gap-10">
                          <div className="text-center">
                            <div className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] mb-2">{t('mockTest.totalParts')}</div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">{selectedSet.lessons.length}</div>
                          </div>
                          <div className="text-center border-x border-slate-200 dark:border-white/10">
                            <div className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] mb-2">{t('mockTest.estimatedTime')}</div>
                            <div className="text-3xl font-black text-primary">
                              {selectedSet.lessons.reduce((acc, l) => acc + (parseInt(l.time || 15, 10) || 15), 0)}m
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] mb-2">{t('mockTest.targetLevel')}</div>
                            <div className="text-3xl font-black text-emerald-500 dark:text-emerald-400">{difficulty === 'all' ? t('mockTest.levelMix') : difficulty}</div>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-border-dark text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.2em]">
                              <th className="px-10 py-5">{t('mockTest.tablePart')}</th>
                              <th className="px-10 py-5">{t('mockTest.tableSkill')}</th>
                              <th className="px-10 py-5">{t('mockTest.tableTopic')}</th>
                              <th className="px-10 py-5 text-right">{t('mockTest.tableDuration')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-border-dark/50">
                            {selectedSet.lessons.map((item, idx) => (
                              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                <td className="px-10 py-6 text-sm font-black text-slate-400 dark:text-gray-500">#0{idx + 1}</td>
                                <td className="px-10 py-6">
                                  <span className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                                    <span className="material-symbols-outlined text-sm">{SKILLS[item.skill]?.icon}</span>
                                    {t(`skills.${item.skill}`)}
                                  </span>
                                </td>
                                <td className="px-10 py-6">
                                  <div className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{item.title}</div>
                                  <div className="text-[10px] text-slate-400 dark:text-gray-500 mt-1 font-bold">{item.level} • {item.description || 'Practice Lesson'}</div>
                                </td>
                                <td className="px-10 py-6 text-right font-mono text-sm font-bold text-slate-500 dark:text-gray-400">
                                  {item.time || item.estimatedTime || '15'} {t('common.minutesShort') || 'm'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="p-10 bg-slate-50 dark:bg-background-dark/50 border-t border-slate-100 dark:border-border-dark">
                        <button
                          onClick={() => setShowConfirmStart(true)}
                          className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-4 text-lg uppercase tracking-widest active:scale-[0.98]"
                        >
                          <span className="material-symbols-outlined font-black text-2xl">play_circle</span>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                      {testSets.map((set) => (
                        <div
                          key={set.id}
                          className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-border-dark p-6 hover:border-primary/50 transition-all group flex flex-col justify-between h-56 shadow-sm hover:shadow-2xl hover:-translate-y-1 duration-300"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-5">
                              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-2xl text-primary">quiz</span>
                              </div>
                              <div className="bg-slate-50 dark:bg-background-dark px-3 py-1 rounded-lg border border-slate-200 dark:border-white/5 text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">
                                {set.lessons.length} {t('mockTest.parts')}
                              </div>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight">{set.title}</h3>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-gray-500 mt-2 uppercase tracking-wider">
                              {selectedSkill === 'all' ? t('mockTest.allSkills') : t(`skills.${selectedSkill}`)} • {t('skills.filterLevel')} {difficulty}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedSet(set)
                              setShowDetail(true)
                            }}
                            className="w-full py-3 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/5 hover:border-primary/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 group-hover:text-primary transition-all mt-6 shadow-inner"
                          >
                            {t('mockTest.viewDetails') || 'Xem chi tiết'}
                          </button>
                        </div>
                      ))}
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
            <div className="space-y-16 pb-20">
              <div className="flex flex-col gap-5">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 uppercase tracking-tight">
                  <span className="material-symbols-outlined text-primary text-4xl bg-primary/10 p-3 rounded-3xl">touch_app</span>
                  {t('mockTest.manualSelection')}
                </h2>
                <div className="p-6 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-[2rem] shadow-sm">
                  <p className="text-sm text-slate-600 dark:text-gray-400 font-medium leading-relaxed">
                    <span className="text-primary font-black uppercase tracking-wider mr-2">{t('mockTest.noteLabel')}</span> {t('mockTest.manualSelectionHint')}
                  </p>
                </div>
              </div>

              {(selectedSkill === 'all' ? ['reading', 'listening', 'writing'] : [selectedSkill]).map(skillKey => {
                const skillLessons = lessons.filter(l => l.skill === skillKey)
                const filtered = skillLessons.filter(l =>
                  l.title?.toLowerCase().includes(manualSearch[skillKey]?.toLowerCase() || '')
                )

                return (
                  <div key={skillKey} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Skill header with Search */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-border-dark pb-6">
                      <div className="flex items-center gap-4">
                        <div className={`size-12 rounded-2xl ${SKILLS[skillKey]?.color.replace('text-', 'bg-')}/10 flex items-center justify-center shadow-sm`}>
                          <span className={`material-symbols-outlined text-2xl ${SKILLS[skillKey]?.color || 'text-primary'}`}>
                            {SKILLS[skillKey]?.icon}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            {t(SKILLS[skillKey]?.label)}
                          </h3>
                          <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">
                            {manualSelection[skillKey]?.length || 0}/4 {t('mockTest.selected')}
                          </p>
                        </div>
                      </div>

                      <div className="relative group w-full md:w-80">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-primary transition-colors">search</span>
                        <input
                          type="text"
                          value={manualSearch[skillKey] || ''}
                          onChange={(e) => setManualSearch(prev => ({ ...prev, [skillKey]: e.target.value }))}
                          placeholder={`${t('dashboard.quickSearch')} ${t(SKILLS[skillKey]?.label)}...`}
                          className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/5 focus:border-primary/50 text-sm font-bold rounded-2xl pl-12 pr-5 py-3.5 text-slate-900 dark:text-white outline-none transition-all shadow-sm focus:ring-4 focus:ring-primary/10"
                        />
                      </div>
                    </div>

                    {/* 2xN Grid with Horizontal Scroll */}
                    <div className="relative group">
                      <div className="overflow-x-auto pb-8 -mx-4 px-4 custom-scrollbar no-scrollbar">
                        <div
                          className="grid grid-flow-col gap-8"
                          style={{
                            gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
                            width: 'max-content'
                          }}
                        >
                          {filtered.length > 0 ? (
                            filtered.map((l) => {
                              const item = { ...l, ...practiceToCard(l, skillKey) }
                              const isSelected = manualSelection[skillKey]?.includes(item.id || item._id)
                              const isListening = skillKey === 'listening'
                              const isWriting = skillKey === 'writing'

                              return (
                                <div
                                  key={item.id || item._id}
                                  onClick={() => handleToggleLesson(l)}
                                  className={`w-[340px] bg-white dark:bg-card-dark rounded-3xl border transition-all duration-300 relative cursor-pointer overflow-hidden group/card ${isSelected
                                      ? 'border-primary ring-4 ring-primary/10 shadow-2xl shadow-primary/20 scale-[1.02] z-10'
                                      : 'border-slate-200 dark:border-border-dark hover:border-primary/50 hover:shadow-xl'
                                    }`}
                                >
                                  {/* Selection Checkmark */}
                                  {isSelected && (
                                    <div className="absolute top-4 right-4 z-30 size-8 bg-primary rounded-full flex items-center justify-center text-white shadow-xl scale-110 animate-in zoom-in duration-300">
                                      <span className="material-symbols-outlined text-lg font-black">check</span>
                                    </div>
                                  )}

                                  {/* Thumbnail */}
                                  <div className="h-40 relative overflow-hidden">
                                    <div
                                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/card:scale-110"
                                      style={{ backgroundImage: `url('${item.img || item.image || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop'}')` }}
                                    />
                                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isSelected ? 'opacity-60' : 'opacity-0 group-hover/card:opacity-100'}`}>
                                      <div className="size-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center scale-75 group-hover/card:scale-100 transition-transform duration-500">
                                        {isListening ? (
                                          <span className="material-symbols-outlined text-white text-3xl">play_circle</span>
                                        ) : isWriting ? (
                                          <span className="material-symbols-outlined text-white text-3xl">edit_note</span>
                                        ) : (
                                          <span className="material-symbols-outlined text-white text-3xl">visibility</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="absolute top-4 left-4">
                                      <span className={`px-2 py-1 ${item.levelColor || 'bg-slate-900/60 text-white'} text-[9px] font-black rounded-lg border border-white/20 uppercase tracking-widest backdrop-blur-md`}>
                                        {item.level}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="p-6 space-y-4">
                                    <div>
                                      <h4 className={`font-black text-base text-slate-900 dark:text-white line-clamp-1 group-hover/card:text-primary transition-colors ${isSelected ? 'text-primary' : ''}`}>
                                        {item.title}
                                      </h4>
                                      <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1 uppercase font-black tracking-widest">
                                        {t(`skills.${skillKey}`)}
                                      </p>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 h-9 leading-relaxed font-medium italic">
                                      {item.desc || item.description}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
                                      <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-lg text-primary/60">schedule</span>
                                        {item.time || '15'}m
                                      </div>
                                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${isSelected ? 'text-primary' : 'text-slate-400 dark:text-gray-500'}`}>
                                        {isSelected ? (
                                          <>
                                            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                                            {t('buttons.selected')}
                                          </>
                                        ) : t('buttons.select')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <div className="w-[340px] h-full min-h-[300px] flex flex-col items-center justify-center bg-slate-50/50 dark:bg-background-dark/30 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-border-dark col-span-full py-10">
                              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-gray-600 mb-3">search_off</span>
                              <p className="text-xs text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest">{t('mockTest.noLessonsData')}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Gradient Indicators for scroll */}
                      <div className="absolute top-0 right-0 bottom-8 w-20 bg-gradient-to-l from-white dark:from-background-dark to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-0 left-0 bottom-8 w-20 bg-gradient-to-r from-white dark:from-background-dark to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
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
