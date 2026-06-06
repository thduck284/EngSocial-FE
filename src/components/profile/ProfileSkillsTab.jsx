import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { userService } from '../../services'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const CEFR_META = {
  A1: { labelKey: 'cefr.beginner', color: '#94a3b8', bg: 'rgba(148,163,184,.15)' },
  A2: { labelKey: 'cefr.elementary', color: '#60a5fa', bg: 'rgba(96,165,250,.15)' },
  B1: { labelKey: 'cefr.intermediate', color: '#34d399', bg: 'rgba(52,211,153,.15)' },
  B2: { labelKey: 'cefr.upperIntermediate', color: '#fbbf24', bg: 'rgba(251,191,36,.15)' },
  C1: { labelKey: 'cefr.advanced', color: '#f97316', bg: 'rgba(249,115,22,.15)' },
  C2: { labelKey: 'cefr.mastery', color: '#a78bfa', bg: 'rgba(167,139,250,.15)' },
}

const SKILLS = [
  { id: 'listening', labelKey: 'skills.listening', icon: 'headphones' },
  { id: 'speaking', labelKey: 'skills.speaking', icon: 'mic' },
  { id: 'reading', labelKey: 'skills.reading', icon: 'menu_book' },
  { id: 'writing', labelKey: 'skills.writing', icon: 'edit_note' },
  { id: 'grammar', labelKey: 'skills.grammar', icon: 'spellcheck' },
  { id: 'vocabulary', labelKey: 'skills.vocabulary', icon: 'abc' },
]

const GOAL_OPTIONS = [
  { id: 'travel', labelKey: 'goals.travel', icon: 'travel_explore' },
  { id: 'work', labelKey: 'goals.work', icon: 'work' },
  { id: 'academic', labelKey: 'goals.academic', icon: 'school' },
  { id: 'exam', labelKey: 'goals.exam', icon: 'assignment' },
  { id: 'creative', labelKey: 'goals.creative', icon: 'auto_stories' },
  { id: 'native', labelKey: 'goals.native', icon: 'emoji_events' },
]

function avgLevel(skills) {
  const avg =
    Object.values(skills).reduce((s, v) => s + CEFR_LEVELS.indexOf(v), 0) /
    SKILLS.length
  return CEFR_LEVELS[Math.min(5, Math.round(avg))]
}

function CefrBadge({ level, t, size = 'md' }) {
  const { color, bg, labelKey } = CEFR_META[level]
  const sz = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold tracking-wide ${sz}`}
      style={{ color, background: bg, border: `1px solid ${color}40` }}
    >
      {level}
      {size !== 'sm' && (
        <span className="font-normal opacity-70">· {t(`profileSkillsTab.${labelKey}`)}</span>
      )}
    </span>
  )
}

function SkillBar({ skill, level, onChange, t }) {
  const idx = CEFR_LEVELS.indexOf(level)
  const { color } = CEFR_META[level]

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ color }}
          >
            {skill.icon}
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {skill.label}
          </span>
        </div>
        <CefrBadge level={level} t={t} />
      </div>

      <div className="flex gap-1.5">
        {CEFR_LEVELS.map((lvl, i) => (
          <button
            key={lvl}
            title={`${lvl} - ${t(`profileSkillsTab.${CEFR_META[lvl].labelKey}`)}`}
            onClick={() => onChange(skill.id, lvl)}
            className="flex-1 h-2.5 rounded-full transition-all duration-200 hover:scale-y-150 focus:outline-none"
            style={{
              background:
                i <= idx ? CEFR_META[lvl].color : 'rgba(148,163,184,.2)',
              opacity: i <= idx ? 1 : 0.5,
            }}
          />
        ))}
      </div>

      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 px-0.5">
        {CEFR_LEVELS.map((lvl) => (
          <span key={lvl}>{lvl}</span>
        ))}
      </div>
    </div>
  )
}

function RadarChart({ skills, t }) {
  const cx = 110
  const cy = 110
  const r = 80
  const n = SKILLS.length

  const pts = SKILLS.map((s, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2
    const frac = (CEFR_LEVELS.indexOf(skills[s.id]) + 1) / 6
    return {
      x: cx + r * frac * Math.cos(angle),
      y: cy + r * frac * Math.sin(angle),
      lx: cx + (r + 22) * Math.cos(angle),
      ly: cy + (r + 22) * Math.sin(angle),
      labelKey: s.labelKey,
      level: skills[s.id],
    }
  })
  const poly = pts.map((p) => `${p.x},${p.y}`).join(' ')

  const rings = [1, 2, 3, 4, 5, 6].map((ring) => {
    const frac = ring / 6
    return SKILLS.map((_, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2
      return `${cx + r * frac * Math.cos(angle)},${
        cy + r * frac * Math.sin(angle)
      }`
    }).join(' ')
  })

  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[220px] mx-auto">
      {rings.map((rpts, i) => (
        <polygon
          key={i}
          points={rpts}
          fill="none"
          stroke="rgba(148,163,184,.15)"
          strokeWidth="1"
        />
      ))}
      {SKILLS.map((_, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + r * Math.cos(angle)}
            y2={cy + r * Math.sin(angle)}
            stroke="rgba(148,163,184,.2)"
            strokeWidth="1"
          />
        )
      })}
      <polygon
        points={poly}
        fill="rgba(99,102,241,.2)"
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill={CEFR_META[p.level].color}
          stroke="white"
          strokeWidth="1.5"
        />
      ))}
      {pts.map((p, i) => (
        <text
          key={i}
          x={p.lx}
          y={p.ly}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9"
          className="fill-slate-500 dark:fill-slate-400"
        >
          {t(`profileSkillsTab.${p.labelKey}`)}
        </text>
      ))}
    </svg>
  )
}

const DEFAULT_SKILLS = Object.fromEntries(SKILLS.map((s) => [s.id, 'A1']))
const STORAGE_KEY = 'profile_english_skills_v1'

export function ProfileSkillsTab({ readOnly = false, initialData = null }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(!readOnly)
  const [skills, setSkills] = useState(() => {
    if (readOnly) return DEFAULT_SKILLS
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved
        ? { ...DEFAULT_SKILLS, ...JSON.parse(saved) }
        : DEFAULT_SKILLS
    } catch {
      return DEFAULT_SKILLS
    }
  })

  const [goals, setGoals] = useState(() => {
    if (readOnly) return []
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_goals')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [saved, setSaved] = useState(false)
  const [activeView, setActiveView] = useState('bars')

  useEffect(() => {
    if (readOnly) return
    userService
      .getSkillsProfile()
      .then((res) => {
        const data = res?.data ?? res ?? {}
        if (data?.skills && typeof data.skills === 'object') {
          setSkills((prev) => ({ ...prev, ...data.skills }))
        }
        if (Array.isArray(data?.goals)) setGoals(data.goals)
        if (data?.activeView === 'bars' || data?.activeView === 'radar') {
          setActiveView(data.activeView)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [readOnly])

  useEffect(() => {
    if (!readOnly) return
    const nextSkills =
      initialData?.skills && typeof initialData.skills === 'object'
        ? { ...DEFAULT_SKILLS, ...initialData.skills }
        : DEFAULT_SKILLS
    setSkills(nextSkills)
    setGoals(Array.isArray(initialData?.goals) ? initialData.goals : [])
    setActiveView(initialData?.activeView === 'radar' ? 'radar' : 'bars')
  }, [readOnly, initialData])

  const overall = avgLevel(skills)
  const { color: overallColor, labelKey: overallLabelKey, bg: overallBg } =
    CEFR_META[overall]
  const overallLabel = t(`profileSkillsTab.${overallLabelKey}`)
  const translatedSkills = SKILLS.map((s) => ({
    ...s,
    label: t(`profileSkillsTab.${s.labelKey}`),
  }))
  const translatedGoals = GOAL_OPTIONS.map((g) => ({
    ...g,
    label: t(`profileSkillsTab.${g.labelKey}`),
  }))

  function handleSkillChange(id, level) {
    if (readOnly) return
    setSkills((prev) => ({ ...prev, [id]: level }))
    setSaved(false)
  }

  function toggleGoal(id) {
    if (readOnly) return
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    )
    setSaved(false)
  }

  function handleSave() {
    if (readOnly) return
    userService
      .updateSkillsProfile({
        skills,
        goals,
        activeView,
      })
      .catch(() => {})
      .finally(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(skills))
          localStorage.setItem(STORAGE_KEY + '_goals', JSON.stringify(goals))
        } catch {
          // ignore
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      })
  }

  function handleReset() {
    if (readOnly) return
    setSkills(DEFAULT_SKILLS)
    setGoals([])
    setSaved(false)
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">psychology</span>
            {readOnly
              ? t('profileSkillsTab.userTitle')
              : t('profileSkillsTab.myTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {readOnly
              ? t('profileSkillsTab.readonlySubtitle')
              : t('profileSkillsTab.subtitle')}
          </p>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg border shrink-0"
          style={{ background: overallBg, borderColor: overallColor + '40' }}
        >
          <div>
            <div className="text-[10px] uppercase tracking-wide font-bold text-slate-400 dark:text-slate-500 mb-0.5">
              {t('profileSkillsTab.overallLevel')}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-lg font-bold"
                style={{ color: overallColor }}
              >
                {overall}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {overallLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
      {loading && !readOnly && (
        <div className="text-xs text-slate-400">{t('profileSkillsTab.loading')}</div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {CEFR_LEVELS.map((lvl) => {
          const { color, bg, labelKey } = CEFR_META[lvl]
          return (
            <span
              key={lvl}
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ color, background: bg, border: `1px solid ${color}30` }}
            >
              <span className="font-bold">{lvl}</span>
              <span className="font-normal opacity-70">{t(`profileSkillsTab.${labelKey}`)}</span>
            </span>
          )
        })}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'bars', label: t('profileSkillsTab.views.bars') },
            { id: 'radar', label: t('profileSkillsTab.views.radar') },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                activeView === v.id
                  ? 'bg-primary text-white border-primary'
                  : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-border-dark hover:border-primary/40'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {activeView === 'bars' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-background-dark/50 rounded-lg border border-slate-100 dark:border-border-dark">
            {translatedSkills.map((skill) => (
              <SkillBar
                key={skill.id}
                skill={skill}
                level={skills[skill.id]}
                onChange={handleSkillChange}
                t={t}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-background-dark/50 rounded-lg border border-slate-100 dark:border-border-dark flex flex-col sm:flex-row items-center gap-4">
            <RadarChart skills={skills} t={t} />
            <div className="flex flex-col gap-1.5 w-full">
              {translatedSkills.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ color: CEFR_META[skills[s.id]].color }}
                    >
                      {s.icon}
                    </span>
                    {s.label}
                  </div>
                  <CefrBadge level={skills[s.id]} t={t} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t('profileSkillsTab.learningGoals')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {readOnly
              ? t('profileSkillsTab.readonlyGoalsSubtitle')
              : t('profileSkillsTab.goalsSubtitle')}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {translatedGoals.map((g) => {
            const active = goals.includes(g.id)
            return (
              <button
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                disabled={readOnly}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left ${
                  active
                    ? 'bg-primary/10 border-primary/40 text-primary dark:text-primary'
                    : 'border-slate-200 dark:border-border-dark text-slate-600 dark:text-slate-400 hover:border-primary/30'
                } ${readOnly ? 'cursor-default' : ''}`}
              >
                <span
                  className={`material-symbols-outlined text-base shrink-0 ${
                    active ? 'text-primary' : 'text-slate-400'
                  }`}
                >
                  {g.icon}
                </span>
                {g.label}
                {active && (
                  <span className="ml-auto material-symbols-outlined text-sm text-primary">
                    check_circle
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {!readOnly && (
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-border-dark">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-base">
            {saved ? 'check_circle' : 'save'}
          </span>
          {saved ? t('profileSkillsTab.saved') : t('profileSkillsTab.saveChanges')}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-border-dark text-slate-500 dark:text-slate-400 text-xs font-medium hover:text-red-500 hover:border-red-200 transition-all"
        >
          <span className="material-symbols-outlined text-base">
            restart_alt
          </span>
          {t('profileSkillsTab.reset')}
        </button>
      </div>
      )}
    </div>
  )
}

