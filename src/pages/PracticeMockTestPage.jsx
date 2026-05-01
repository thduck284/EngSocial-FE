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

  const loadMockHistory = async (page = 1, append = false) => {
    setLoadingHistory(true)
    try {
      const res = await mockTestService.getUserSessions({ page, limit: 5 })
      const list = Array.isArray(res?.data) ? res.data : []
      
      if (append) {
        setMockHistory(prev => [...prev, ...list])
      } else {
        setMockHistory(list)
      }

      // Check if there are more pages
      const pagination = res?.pagination || {}
      setHasMoreHistory(pagination.currentPage < pagination.totalPages)
      setHistoryPage(pagination.currentPage)
    } catch (error) {
      console.error('Failed to load mock history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleLoadMoreHistory = () => {
    loadMockHistory(historyPage + 1, true)
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
      totalDurationSec
    }
    localStorage.setItem('engsocial_mock_test', JSON.stringify(mockTestData))
    localStorage.removeItem('engsocial_mock_test_answers')
    const first = selectedSet.lessons[0]
    navigate(`/practice/${first.skill}/${first._id || first.id}/study`)
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="grid grid-cols-12 gap-8">

        {/* LEFT BAR: Info & Tips */}
        <aside className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-6 self-start h-fit">
          <div className="bg-card-dark rounded-2xl p-6 border border-border-dark shadow-sm">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              {t('mockTest.howItWorks')}
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex gap-3">
                <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                <p>{t('mockTest.step1')}</p>
              </li>
              <li className="flex gap-3">
                <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                <p>{t('mockTest.step2')}</p>
              </li>
              <li className="flex gap-3">
                <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                <p>{t('mockTest.step3')}</p>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-primary/20 to-transparent rounded-2xl p-6 border border-primary/20">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-500 fill-icon">emoji_events</span>
              {t('mockTest.proTip')}
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed italic">
              {t('mockTest.tipText')}
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT: Generator & Results */}
        <main className="col-span-12 lg:col-span-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">
              {t('skills.mockTest')}
            </h1>
            <p className="text-gray-400">{t('mockTest.desc')}</p>
          </div>

          {/* Configuration Card */}
          <div className="bg-card-dark rounded-3xl border border-border-dark p-8 shadow-xl">
            <div className="space-y-10">

              {/* Skill Selection Grid with All Skills Option */}
              <div className="space-y-6">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">psychology</span>
                  {t('mockTest.targetSkill') || 'Target Skill'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* All Skills Option */}
                  <button
                    onClick={() => setSelectedSkill('all')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${selectedSkill === 'all'
                        ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10'
                        : 'bg-background-dark/50 border-white/5 text-gray-500 hover:border-white/10'
                      }`}
                  >
                    <span className="material-symbols-outlined text-2xl font-light">grid_view</span>
                    <span className="text-[10px] font-bold uppercase truncate">{t('mockTest.allSkills')}</span>
                  </button>

                  {Object.entries(SKILLS).map(([key, { icon, label }]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedSkill(key)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${selectedSkill === key
                          ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10'
                          : 'bg-background-dark/50 border-white/5 text-gray-500 hover:border-white/10'
                        }`}
                    >
                      <span className="material-symbols-outlined text-2xl font-light">{icon}</span>
                      <span className="text-[10px] font-bold uppercase truncate">{t(label)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mode Select (Type) */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">shuffle</span>
                    {t('mockTest.selectionType') || 'Type'}
                  </label>
                  <div className="relative group">
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full bg-background-dark/80 hover:bg-background-dark border border-white/5 hover:border-primary/50 text-sm rounded-2xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary/30 outline-none appearance-none transition-all cursor-pointer font-bold"
                    >
                      <option value="random">{t('mockTest.random')}</option>
                      <option value="manual">{t('mockTest.manual')}</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none group-hover:text-primary transition-colors">unfold_more</span>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">leaderboard</span>
                    {t('skills.filterLevel')}
                  </label>
                  <div className="relative group">
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      disabled={mode === 'manual'}
                      className="w-full bg-background-dark/80 hover:bg-background-dark border border-white/5 hover:border-primary/50 text-sm rounded-2xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary/30 outline-none appearance-none transition-all cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="all">{t('skills.filterAll')}</option>
                      <option value="A1">{t('mockTest.levels.A1')}</option>
                      <option value="A2">{t('mockTest.levels.A2')}</option>
                      <option value="B1">{t('mockTest.levels.B1')}</option>
                      <option value="B2">{t('mockTest.levels.B2')}</option>
                      <option value="C1">{t('mockTest.levels.C1')}</option>
                      <option value="C2">{t('mockTest.levels.C2')}</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none group-hover:text-primary transition-colors">unfold_more</span>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">history_edu</span>
                    {t('mockTest.historyStatus') || 'History Status'}
                  </label>
                  <div className="relative group">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={mode === 'manual'}
                      className="w-full bg-background-dark/80 hover:bg-background-dark border border-white/5 hover:border-primary/50 text-sm rounded-2xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary/30 outline-none appearance-none transition-all cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="new">{t('mockTest.filterNew')}</option>
                      <option value="all">{t('mockTest.filterAll')}</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none group-hover:text-primary transition-colors">unfold_more</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={mode === 'manual' ? handleStartManual : handleGenerate}
              disabled={loading || (mode === 'manual' && !isManualValid())}
              className="w-full mt-10 py-5 bg-primary hover:bg-primary/90 text-background-dark font-black rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform border-2 border-background-dark rounded-full">
                    {mode === 'manual' ? 'visibility' : 'bolt'}
                  </span>
                  {mode === 'manual' ? (t('mockTest.viewDetails') || 'Xem chi tiết') : (t('mockTest.generateBtn') || 'Generate Test Set')}
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
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                      >
                        <span className="material-symbols-outlined text-gray-400">arrow_back</span>
                      </button>
                      <h2 className="text-2xl font-black text-white">
                        {selectedSet.title} - {t('mockTest.detailTitle') || 'Details'}
                      </h2>
                    </div>

                    <div className="bg-card-dark rounded-3xl border border-border-dark overflow-hidden shadow-2xl">
                      <div className="p-8 border-b border-border-dark bg-primary/5">
                        <div className="grid grid-cols-3 gap-8">
                          <div className="text-center">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{t('mockTest.totalParts')}</div>
                            <div className="text-2xl font-black text-white">{selectedSet.lessons.length}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{t('mockTest.estimatedTime')}</div>
                            <div className="text-2xl font-black text-primary">
                              {selectedSet.lessons.reduce((acc, l) => acc + (parseInt(l.time || 15, 10) || 15), 0)}m
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{t('mockTest.targetLevel')}</div>
                            <div className="text-2xl font-black text-emerald-400">{difficulty === 'all' ? t('mockTest.levelMix') : difficulty}</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-0">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-border-dark text-[10px] text-gray-500 font-black uppercase tracking-widest">
                              <th className="px-8 py-4">{t('mockTest.tablePart')}</th>
                              <th className="px-8 py-4">{t('mockTest.tableSkill')}</th>
                              <th className="px-8 py-4">{t('mockTest.tableTopic')}</th>
                              <th className="px-8 py-4 text-right">{t('mockTest.tableDuration')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-dark/50">
                            {selectedSet.lessons.map((item, idx) => (
                              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-8 py-5 text-sm font-bold text-gray-400">#0{idx + 1}</td>
                                <td className="px-8 py-5">
                                  <span className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase">
                                    <span className="material-symbols-outlined text-sm">{SKILLS[item.skill]?.icon}</span>
                                    {t(`skills.${item.skill}`)}
                                  </span>
                                </td>
                                <td className="px-8 py-5">
                                  <div className="text-sm font-bold text-white">{item.title}</div>
                                  <div className="text-[10px] text-gray-500 mt-1">{item.level} • {item.description || 'Practice Lesson'}</div>
                                </td>
                                <td className="px-8 py-5 text-right font-mono text-sm text-gray-400">
                                  {item.time || item.estimatedTime || '15'} {t('common.minutesShort') || 'm'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="p-8 bg-background-dark/50 border-t border-border-dark">
                        <button
                          onClick={() => setShowConfirmStart(true)}
                          className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-background-dark font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 text-lg"
                        >
                          <span className="material-symbols-outlined font-black">play_circle</span>
                          {t('mockTest.startTest') || 'Bắt đầu làm bài'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* SETS LIST VIEW MODE */
                  <div className="space-y-6">
                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">diversity_1</span>
                      {t('mockTest.generatedSets') || 'Generated Test Sets'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                      {testSets.map((set) => (
                        <div
                          key={set.id}
                          className="bg-card-dark rounded-2xl border border-border-dark p-6 hover:border-primary/50 transition-all group flex flex-col justify-between h-48"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <span className="material-symbols-outlined text-4xl text-primary opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all">quiz</span>
                              <div className="bg-background-dark px-2 py-1 rounded border border-white/5 text-[10px] font-black text-gray-500 uppercase">
                                {set.lessons.length} {t('mockTest.parts')}
                              </div>
                            </div>
                            <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors">{set.title}</h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {selectedSkill === 'all' ? t('mockTest.allSkills') : t(`skills.${selectedSkill}`)} • {t('skills.filterLevel')} {difficulty}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedSet(set)
                              setShowDetail(true)
                            }}
                            className="w-full py-2.5 bg-background-dark border border-white/5 hover:border-primary/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary transition-all mt-4"
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
                          className="px-10 py-4 bg-card-dark border border-white/10 hover:border-primary/50 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-all flex items-center gap-3 shadow-xl"
                        >
                          {loading ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                          ) : (
                            <>
                              <span className="material-symbols-outlined">add_circle</span>
                              {t('common.showMore') || 'Xem thêm'}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )
              ) : (
                /* EMPTY STATE */
                <div className="bg-background-dark/30 rounded-3xl border border-dashed border-border-dark py-24 flex flex-col items-center justify-center text-center px-8">
                  <div className="size-20 bg-card-dark rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-3xl text-gray-600">quiz</span>
                  </div>
                  <h3 className="text-gray-400 font-bold mb-2">{t('mockTest.emptyStateTitle') || 'Ready to challenge yourself?'}</h3>
                  <p className="text-sm text-gray-600 max-w-xs">{t('mockTest.emptyStateDesc') || 'Configure your criteria above and click Generate to find the best practice set for you.'}</p>
                </div>
              )}
            </div>
          )}

          {/* MANUAL SELECTION AREA */}
          {mode === 'manual' && (
            <div className="space-y-12">
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-3xl">touch_app</span>
                  {t('mockTest.manualSelection')}
                </h2>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                  <p className="text-sm text-gray-400">
                    <span className="text-primary font-bold">{t('mockTest.noteLabel')}</span> {t('mockTest.manualSelectionHint')}
                  </p>
                </div>
              </div>

              {(selectedSkill === 'all' ? ['reading', 'listening', 'writing'] : [selectedSkill]).map(skillKey => {
                const skillLessons = lessons.filter(l => l.skill === skillKey)
                const filtered = skillLessons.filter(l =>
                  l.title?.toLowerCase().includes(manualSearch[skillKey]?.toLowerCase() || '')
                )

                return (
                  <div key={skillKey} className="space-y-6">
                    {/* Skill header with Search */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-dark pb-4">
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-2xl ${SKILLS[skillKey]?.color || 'text-primary'}`}>
                          {SKILLS[skillKey]?.icon}
                        </span>
                        <h3 className="text-lg font-black text-white uppercase tracking-wider">
                          {t(SKILLS[skillKey]?.label)}
                          <span className="ml-3 text-xs font-medium text-gray-500 normal-case">
                            ({manualSelection[skillKey]?.length || 0}/4 {t('mockTest.selected')})
                          </span>
                        </h3>
                      </div>

                      <div className="relative group w-full md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-primary transition-colors">search</span>
                        <input
                          type="text"
                          value={manualSearch[skillKey] || ''}
                          onChange={(e) => setManualSearch(prev => ({ ...prev, [skillKey]: e.target.value }))}
                          placeholder={`${t('dashboard.quickSearch')} ${t(SKILLS[skillKey]?.label)}...`}
                          className="w-full bg-background-dark/50 border border-white/5 focus:border-primary/50 text-xs rounded-xl pl-9 pr-4 py-2.5 text-white outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* 2xN Grid with Horizontal Scroll */}
                    <div className="relative group">
                      <div className="overflow-x-auto pb-6 -mx-2 px-2 custom-scrollbar">
                        <div
                          className="grid grid-flow-col gap-6"
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
                                  className={`w-[320px] bg-card-dark rounded-2xl border transition-all relative cursor-pointer overflow-hidden ${isSelected
                                      ? 'border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10'
                                      : 'border-border-dark hover:border-primary/50'
                                    }`}
                                >
                                  {/* Selection Checkmark */}
                                  {isSelected && (
                                    <div className="absolute top-3 right-3 z-30 size-7 bg-primary rounded-full flex items-center justify-center text-background-dark shadow-xl scale-110">
                                      <span className="material-symbols-outlined text-lg font-black">check</span>
                                    </div>
                                  )}

                                  {/* Thumbnail */}
                                  <div className="h-32 relative overflow-hidden">
                                    <div
                                      className="absolute inset-0 bg-cover bg-center"
                                      style={{ backgroundImage: `url('${item.img || item.image || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop'}')` }}
                                    />
                                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isSelected ? 'opacity-60' : 'opacity-0'}`}>
                                      {isListening ? (
                                        <span className="material-symbols-outlined text-white text-4xl">play_circle</span>
                                      ) : isWriting ? (
                                        <span className="material-symbols-outlined text-white text-4xl">edit_note</span>
                                      ) : (
                                        <span className="material-symbols-outlined text-white text-4xl">menu_book</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="p-5 space-y-3">
                                    <div className="flex justify-between items-start gap-4">
                                      <h4 className={`font-bold text-sm text-white line-clamp-1 ${isSelected ? 'text-primary' : ''}`}>
                                        {item.title}
                                      </h4>
                                      <span className={`px-1.5 py-0.5 ${item.levelColor || 'bg-background-dark text-gray-400'} text-[9px] font-black rounded border border-white/5 shrink-0`}>
                                        {item.level}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 line-clamp-2 h-8 leading-relaxed">
                                      {item.desc || item.description}
                                    </p>
                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
                                        <span className="material-symbols-outlined text-xs">schedule</span>
                                        {item.time || '15'}m
                                      </div>
                                      <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${isSelected ? 'text-primary' : 'text-gray-500'}`}>
                                        {isSelected ? t('buttons.selected') : t('buttons.select')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <div className="w-[320px] h-[300px] flex flex-col items-center justify-center bg-background-dark/30 rounded-2xl border border-dashed border-border-dark col-span-full">
                              <span className="material-symbols-outlined text-3xl text-gray-600 mb-2">search_off</span>
                              <p className="text-xs text-gray-500">{t('mockTest.noLessonsData')}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Gradient Indicators for scroll */}
                      <div className="absolute top-0 right-0 bottom-6 w-12 bg-gradient-to-l from-background-dark to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>

        {/* RIGHT BAR: History & Stats */}
        <aside className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-6 self-start h-fit">
          <div className="bg-card-dark rounded-2xl p-6 border border-border-dark space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg text-sm">history</span>
              {t('manageLessons.tabMockTests')}
            </h3>

            <div className="space-y-4">
              {loadingHistory ? (
                <div className="flex justify-center py-4">
                  <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                </div>
              ) : mockHistory.length > 0 ? (
                mockHistory.map((item) => (
                  <div 
                    key={item._id || item.id} 
                    onClick={() => handleViewSession(item._id || item.id)}
                    className="p-3 bg-background-dark/50 rounded-xl border border-white/5 hover:border-primary/20 transition-all group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${item.status === 'graded' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                        {item.status === 'graded' ? t('manageLessons.statusGraded') : t('manageLessons.statusNotGraded')}
                      </span>
                      <span className="text-[9px] text-gray-500 font-bold">
                        {new Date(item.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-primary transition-colors truncate mb-1">
                      {item.title || `${t('skills.mockTest')} #${(item._id || item.id || '').slice(-4)}`}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-gray-400">
                        {item.overallScore}/{item.maxTotalScore}
                      </div>
                      <div className="text-[10px] font-black text-primary">
                        {Math.round((item.overallScore / (item.maxTotalScore || 1)) * 100)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 space-y-2">
                  <span className="material-symbols-outlined text-gray-700 text-3xl">history</span>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{t('mockTest.noHistory') || 'No Recent Tests'}</p>
                </div>
              )}
            </div>

            {hasMoreHistory && (
              <button
                onClick={handleLoadMoreHistory}
                disabled={loadingHistory}
                className="w-full py-3 text-xs font-bold text-gray-500 hover:text-primary transition-colors border-t border-white/5 flex items-center justify-center gap-2"
              >
                {loadingHistory ? (
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    {t('common.showMore') || 'Xem thêm'}
                  </>
                )}
              </button>
            )}
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
