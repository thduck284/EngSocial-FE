import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lessonsService } from '../services/lessons.service'
import { ROUTES } from '../constants'
import { SKILLS } from '../constants'

export function PracticeMockTestPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [lessons, setLessons] = useState([])
  const [filteredResults, setFilteredResults] = useState([])

  // Configuration State
  const [mode, setMode] = useState('random') // 'random' | 'manual'
  const [difficulty, setDifficulty] = useState('all')
  const [status, setStatus] = useState('new') // 'new' | 'all'
  const [selectedSkill, setSelectedSkill] = useState('all')

  useEffect(() => {
    loadAllLessons()
  }, [])

  const loadAllLessons = async () => {
    setLoading(true)
    try {
      // In a real app, we might want a dedicated endpoint for all practice lessons 
      // or fetch in batches. For now, we'll use the existing service.
      const res = await lessonsService.getPractices({ limit: 100 })
      setLessons(res?.data?.lessons || [])
    } catch (error) {
      console.error('Failed to load lessons for mock test:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = () => {
    setLoading(true)
    
    if (mode === 'random') {
      if (selectedSkill === 'all') {
        // Pick 4 from EACH skill
        const result = []
        ;['reading', 'listening', 'writing'].forEach(skill => {
          const pool = lessons.filter(l => 
            l.skill === skill && 
            (difficulty === 'all' || l.level === difficulty) &&
            (status === 'all' || !l.isCompleted)
          )
          const shuffled = [...pool].sort(() => 0.5 - Math.random())
          result.push(...shuffled.slice(0, 4))
        })
        setFilteredResults(result)
      } else {
        // Pick 4 from specific skill
        const pool = lessons.filter(l => {
          const matchSkill = l.skill === selectedSkill
          const matchDifficulty = difficulty === 'all' || l.level === difficulty
          const matchStatus = status === 'all' || !l.isCompleted
          return matchSkill && matchDifficulty && matchStatus
        })
        const shuffled = [...pool].sort(() => 0.5 - Math.random())
        setFilteredResults(shuffled.slice(0, 4))
      }
    } else {
      // Manual mode: still filter based on criteria
      let pool = lessons.filter(l => {
        const matchSkill = selectedSkill === 'all' || l.skill === selectedSkill
        const matchDifficulty = difficulty === 'all' || l.level === difficulty
        const matchStatus = status === 'all' || !l.isCompleted
        return matchSkill && matchDifficulty && matchStatus
      })
      setFilteredResults(pool)
    }
    
    setTimeout(() => setLoading(false), 500)
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="grid grid-cols-12 gap-8">
        
        {/* LEFT BAR: Info & Tips */}
        <aside className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-6 self-start h-fit">
          <div className="bg-card-dark rounded-2xl p-6 border border-border-dark shadow-sm">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              {t('mockTest.howItWorks') || 'How it works'}
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex gap-3">
                <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                <p>{t('mockTest.step1') || 'Select your target skill or mix all of them.'}</p>
              </li>
              <li className="flex gap-3">
                <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                <p>{t('mockTest.step2') || 'Choose between a balanced random set or pick manually.'}</p>
              </li>
              <li className="flex gap-3">
                <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                <p>{t('mockTest.step3') || 'Complete the lessons to simulate a real exam environment.'}</p>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-primary/20 to-transparent rounded-2xl p-6 border border-primary/20">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-500 fill-icon">emoji_events</span>
              {t('mockTest.proTip') || 'Pro Tip'}
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed italic">
              {t('mockTest.tipText') || '"Consistency is key. Try taking one Practice Test every weekend to track your progress effectively."'}
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
            <p className="text-gray-400">{t('mockTest.desc') || 'Create a custom exam environment to sharpen your skills.'}</p>
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
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                      selectedSkill === 'all' 
                      ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10' 
                      : 'bg-background-dark/50 border-white/5 text-gray-500 hover:border-white/10'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl font-light">grid_view</span>
                    <span className="text-[10px] font-bold uppercase truncate">{t('mockTest.allSkills') || 'Toàn bộ'}</span>
                  </button>

                  {Object.entries(SKILLS).map(([key, { icon, label }]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedSkill(key)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                        selectedSkill === key 
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
                      <option value="random">{t('mockTest.random') || 'Ngẫu nhiên'}</option>
                      <option value="manual">{t('mockTest.manual') || 'Tự chọn'}</option>
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
                      className="w-full bg-background-dark/80 hover:bg-background-dark border border-white/5 hover:border-primary/50 text-sm rounded-2xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary/30 outline-none appearance-none transition-all cursor-pointer font-bold"
                    >
                      <option value="all">{t('skills.filterAll')}</option>
                      <option value="A1">A1 - Beginner</option>
                      <option value="A2">A2 - Elementary</option>
                      <option value="B1">B1 - Intermediate</option>
                      <option value="B2">B2 - Upper Intermediate</option>
                      <option value="C1">C1 - Advanced</option>
                      <option value="C2">C2 - Proficiency</option>
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
                      className="w-full bg-background-dark/80 hover:bg-background-dark border border-white/5 hover:border-primary/50 text-sm rounded-2xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary/30 outline-none appearance-none transition-all cursor-pointer font-bold"
                    >
                      <option value="new">{t('mockTest.filterNew') || 'Đề chưa thi'}</option>
                      <option value="all">{t('mockTest.filterAll') || 'Toàn bộ'}</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none group-hover:text-primary transition-colors">unfold_more</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-10 py-5 bg-primary hover:bg-primary/90 text-background-dark font-black rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-500">bolt</span>
                  {t('mockTest.generateBtn') || 'Generate Test Set'}
                </>
              )}
            </button>
          </div>

          {/* RESULTS AREA */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">analytics</span>
              {t('mockTest.readySet') || 'Your Ready-to-Test Set'}
              <span className="text-xs font-medium text-gray-500 ml-auto">
                {filteredResults.length} {t('mockTest.lessonsFound') || 'lessons matched'}
              </span>
            </h2>

            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {filteredResults.map((item) => (
                  <Link
                    key={item._id || item.id}
                    to={`/practice/${item.skill || selectedSkill}/${item._id || item.id}`}
                    className="bg-card-dark rounded-2xl border border-border-dark overflow-hidden hover:border-primary/50 transition-all group relative"
                  >
                    {/* Badge for skill type */}
                    <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-black/60 backdrop-blur rounded text-[9px] font-black text-primary uppercase tracking-wider border border-white/10 group-hover:bg-primary group-hover:text-background-dark transition-colors">
                      {item.skill}
                    </div>

                    <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url('${item.image || item.img || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop'}')` }} />
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{item.title}</h4>
                        <span className="px-2 py-0.5 bg-background-dark text-[10px] font-black rounded text-gray-400 border border-white/5">{item.level}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4">{item.description || item.desc}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {item.time || item.estimatedTime || '15'}m
                          </div>
                          {item.totalQuestions > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              <span className="material-symbols-outlined text-sm">quiz</span>
                              {t('lessons.questionsCount', { count: item.totalQuestions })}
                            </div>
                          )}
                        </div>
                        <span className="text-primary text-[10px] font-black uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          {t('buttons.start')}
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-background-dark/30 rounded-3xl border border-dashed border-border-dark py-24 flex flex-col items-center justify-center text-center px-8">
                <div className="size-20 bg-card-dark rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl text-gray-600">quiz</span>
                </div>
                <h3 className="text-gray-400 font-bold mb-2">{t('mockTest.emptyStateTitle') || 'Ready to challenge yourself?'}</h3>
                <p className="text-sm text-gray-600 max-w-xs">{t('mockTest.emptyStateDesc') || 'Configure your criteria above and click Generate to find the best practice set for you.'}</p>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT BAR: History & Stats */}
        <aside className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-6 self-start h-fit">
          <div className="bg-card-dark rounded-2xl p-6 border border-border-dark space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-500 fill-icon">trending_up</span>
              {t('mockTest.recentStats') || 'Recent Stats'}
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-background-dark/50 rounded-xl border border-white/5">
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{t('mockTest.totalExams') || 'Total Practice Sets'}</div>
                <div className="text-2xl font-black text-white">12</div>
              </div>
              <div className="p-4 bg-background-dark/50 rounded-xl border border-white/5">
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{t('mockTest.avgScore') || 'Avg. Performance'}</div>
                <div className="text-2xl font-black text-emerald-400">88%</div>
              </div>
            </div>

            <Link to={ROUTES.LESSON_HISTORY} className="block text-center py-3 text-xs font-bold text-gray-500 hover:text-primary transition-colors">
              {t('lessons.viewHistory')}
            </Link>
          </div>

          <div className="bg-card-dark rounded-2xl p-6 border border-border-dark relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <span className="material-symbols-outlined text-3xl text-primary mb-4">military_tech</span>
              <h4 className="font-bold text-white mb-2">{t('mockTest.hallOfFame') || 'Hall of Fame'}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                {t('mockTest.fameDesc') || 'Complete 5 consecutive perfect Practice Tests to earn the Master Badge.'}
              </p>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="size-8 rounded-full border-2 border-card-dark bg-gray-700 overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} alt="" />
                  </div>
                ))}
                <div className="size-8 rounded-full border-2 border-card-dark bg-background-dark flex items-center justify-center text-[10px] text-gray-400 font-bold">+24</div>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
