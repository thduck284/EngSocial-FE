import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { adminService } from '../services'
import { ROUTES } from '../constants'
import { useAuth } from '../context/AuthContext'

function TrendBadge({ delta, percent, upGood = true, t }) {
  const flat = delta === 0 && (percent === 0 || percent == null)
  if (flat) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-gray-400 backdrop-blur-sm">
        <span className="material-symbols-outlined text-[18px] opacity-80">horizontal_rule</span>
        {t('adminConsole.overviewFlat')}
      </span>
    )
  }
  const positive = delta > 0
  const good = upGood ? positive : !positive
  const styles = good
    ? 'border-emerald-500/25 bg-emerald-500/[0.12] text-emerald-300 shadow-[0_0_20px_-8px_rgba(52,211,153,0.35)]'
    : 'border-amber-500/25 bg-amber-500/[0.12] text-amber-200 shadow-[0_0_20px_-8px_rgba(251,191,36,0.25)]'
  const icon = positive ? 'trending_up' : 'trending_down'
  const pctStr =
    percent != null && Number.isFinite(percent) ? ` · ${positive ? '+' : '−'}${Math.abs(percent)}%` : ''
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${styles}`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      <span className="tabular-nums">
        {positive ? '+' : ''}
        {delta}
        {pctStr}
      </span>
      <span className="font-normal text-white/40">· {t('adminConsole.vsLastMonth')}</span>
    </span>
  )
}

/** Hai thanh so sánh tháng này / tháng trước (tỉ lệ trong max của hai tháng) */
function MonthCompareBar({ current, previous, goodWhenLower = false, t }) {
  const a = Math.max(0, Number(current) || 0)
  const b = Math.max(0, Number(previous) || 0)
  const max = Math.max(a, b, 1)
  const wThis = `${Math.min(100, Math.round((a / max) * 100))}%`
  const wLast = `${Math.min(100, Math.round((b / max) * 100))}%`
  const fillThis = goodWhenLower
    ? 'bg-gradient-to-r from-amber-500/90 to-rose-400/75'
    : 'bg-gradient-to-r from-primary to-cyan-400'
  const fillLast = 'bg-gradient-to-r from-white/25 to-white/10'
  return (
    <div className="space-y-3 pt-1">
      <div>
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
          <span>{t('adminConsole.overviewBarThisMonth')}</span>
          <span className="tabular-nums text-gray-400">{a}</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden bg-black/45 ring-1 ring-white/[0.06]">
          <div className={`h-full rounded-full transition-all duration-700 ease-out ${fillThis}`} style={{ width: wThis }} />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
          <span>{t('adminConsole.overviewBarLastMonth')}</span>
          <span className="tabular-nums text-gray-400">{b}</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden bg-black/45 ring-1 ring-white/[0.06]">
          <div className={`h-full rounded-full transition-all duration-700 ease-out ${fillLast}`} style={{ width: wLast }} />
        </div>
      </div>
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 animate-pulse">
      {[0, 1].map((k) => (
        <div
          key={k}
          className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-6 h-[280px]"
        >
          <div className="h-4 w-24 bg-white/10 rounded-lg mb-8" />
          <div className="h-10 w-32 bg-white/10 rounded-xl mb-4" />
          <div className="h-3 w-40 bg-white/5 rounded mb-8" />
          <div className="h-8 w-28 bg-white/10 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

function InsightCard({
  accent,
  icon,
  sectionTitle,
  mainLabel,
  mainValue,
  subLine,
  monthLabel,
  monthValue,
  delta,
  percent,
  upGood,
  compareCurrent,
  comparePrevious,
  compareGoodWhenLower,
  t,
}) {
  const border =
    accent === 'sky'
      ? 'from-primary/40 via-cyan-400/20 to-transparent'
      : 'from-amber-400/35 via-orange-400/15 to-transparent'

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-card-dark/90 p-6 md:p-7 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.55)] transition-transform duration-300 hover:-translate-y-0.5`}
    >
      <div
        className={`pointer-events-none absolute inset-0 opacity-90 bg-gradient-to-br ${accent === 'sky' ? 'from-primary/[0.08] via-transparent to-transparent' : 'from-amber-500/[0.07] via-transparent to-transparent'}`}
      />
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-40 bg-gradient-to-br ${border}`}
      />
      <div className="relative flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">{sectionTitle}</p>
          <p className="text-sm text-gray-400">{mainLabel}</p>
        </div>
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1 backdrop-blur-md transition-transform duration-300 group-hover:scale-105 ${
            accent === 'sky'
              ? 'bg-primary/20 text-primary ring-primary/30 shadow-[0_0_24px_-6px_rgba(19,182,236,0.5)]'
              : 'bg-amber-500/15 text-amber-200 ring-amber-400/25 shadow-[0_0_24px_-6px_rgba(251,191,36,0.35)]'
          }`}
        >
          <span className="material-symbols-outlined text-[26px]">{icon}</span>
        </div>
      </div>
      <div className="relative">
        <p className="text-4xl md:text-5xl font-bold tracking-tight text-white tabular-nums bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
          {mainValue ?? '—'}
        </p>
        {subLine ? <p className="mt-2 text-sm text-gray-400 leading-relaxed">{subLine}</p> : null}
      </div>
      <div className="relative mt-8 pt-6 border-t border-white/[0.06]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">{monthLabel}</p>
            <p className="text-2xl font-bold text-white tabular-nums">{monthValue ?? 0}</p>
          </div>
          <div className="sm:pb-0.5">
            <TrendBadge delta={delta ?? 0} percent={percent} upGood={upGood} t={t} />
          </div>
        </div>
        <div className="mt-5">
          <MonthCompareBar
            current={compareCurrent}
            previous={comparePrevious}
            goodWhenLower={compareGoodWhenLower}
            t={t}
          />
        </div>
      </div>
    </article>
  )
}

export function AdminOverviewPage() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const myId = currentUser?.id ?? currentUser?._id

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)

  const load = useCallback(() => {
    setError('')
    setLoading(true)
    adminService
      .getSystemStats()
      .then((res) => {
        const s = res?.data?.stats ?? res?.stats ?? null
        setStats(s)
      })
      .catch(() => {
        setStats(null)
        setError(t('adminConsole.loadError'))
      })
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  const ov = stats?.overview
  const monthLabel = useMemo(() => {
    if (!ov?.monthYear || ov.monthIndex == null) return ''
    try {
      return new Date(ov.monthYear, ov.monthIndex - 1, 1).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return ''
    }
  }, [ov])

  return (
    <div className="relative min-h-full">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/[0.07] via-transparent to-transparent" />
      <div className="relative p-5 md:p-8 max-w-6xl mx-auto pb-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 md:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary/90 mb-3">
              <span className="material-symbols-outlined text-[16px]">insights</span>
              EngSocial
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {t('adminConsole.overviewTitle')}
            </h1>
            <p className="mt-2 text-sm text-gray-400 max-w-xl leading-relaxed">
              {t('staffDashboard.adminConsoleSubtitle')}
            </p>
            {monthLabel ? (
              <p className="mt-3 inline-flex items-center gap-2 text-xs text-gray-500">
                <span className="material-symbols-outlined text-[16px] text-primary/70">calendar_month</span>
                {t('adminConsole.overviewMonthContext', { month: monthLabel })}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/[0.09] hover:border-primary/30 hover:text-white transition-all disabled:opacity-50"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}
            >
              {loading ? 'progress_activity' : 'refresh'}
            </span>
            {loading ? t('adminConsole.overviewLoading') : t('adminConsole.overviewRefresh')}
          </button>
        </header>

        {loading ? (
          <OverviewSkeleton />
        ) : error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.06] p-8 text-center">
            <span className="material-symbols-outlined text-red-400 text-4xl mb-3 block">error</span>
            <p className="text-red-300 font-medium">{error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
            >
              {t('adminConsole.overviewRetry')}
            </button>
          </div>
        ) : !ov ? (
          <div className="rounded-3xl border border-white/[0.08] bg-card-dark/50 p-12 text-center text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-40">analytics</span>
            {t('adminConsole.overviewNoData')}
          </div>
        ) : (
          <>
            {stats?.users?.newThisWeek != null ? (
              <div className="mb-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 backdrop-blur-sm">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                    <span className="material-symbols-outlined">person_add</span>
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                      {t('adminConsole.overviewNewUsersWeek')}
                    </p>
                    <p className="text-xl font-bold text-white tabular-nums">{stats.users.newThisWeek}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              <InsightCard
                accent="sky"
                icon="groups"
                sectionTitle={t('adminConsole.overviewUsersSection')}
                mainLabel={t('adminConsole.overviewTotalUsers')}
                mainValue={ov.users?.total}
                subLine={t('adminConsole.overviewActiveUsers', { count: ov.users?.active ?? 0 })}
                monthLabel={t('adminConsole.overviewNewUsersThisMonth')}
                monthValue={ov.users?.newThisMonth ?? 0}
                delta={ov.users?.deltaVsLastMonth ?? 0}
                percent={ov.users?.percentVsLastMonth}
                upGood
                compareCurrent={ov.users?.newThisMonth ?? 0}
                comparePrevious={ov.users?.newLastMonth ?? 0}
                compareGoodWhenLower={false}
                t={t}
              />
              <InsightCard
                accent="amber"
                icon="flag"
                sectionTitle={t('adminConsole.overviewReportsSection')}
                mainLabel={t('adminConsole.overviewTotalReports')}
                mainValue={ov.reports?.total}
                subLine={t('adminConsole.overviewPendingReports', { count: ov.reports?.pending ?? 0 })}
                monthLabel={t('adminConsole.overviewNewReportsThisMonth')}
                monthValue={ov.reports?.newThisMonth ?? 0}
                delta={ov.reports?.deltaVsLastMonth ?? 0}
                percent={ov.reports?.percentVsLastMonth}
                upGood={false}
                compareCurrent={ov.reports?.newThisMonth ?? 0}
                comparePrevious={ov.reports?.newLastMonth ?? 0}
                compareGoodWhenLower
                t={t}
              />
            </div>

            <section className="mt-8 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-card-dark via-card-dark to-black/30 p-6 md:p-8 overflow-hidden relative">
              <div className="pointer-events-none absolute right-0 bottom-0 w-64 h-64 bg-primary/[0.04] rounded-full blur-3xl" />
              <h2 className="relative text-sm font-bold uppercase tracking-[0.15em] text-gray-500 mb-5">
                {t('adminConsole.overviewQuickLinks')}
              </h2>
              <div className="relative grid gap-3 sm:grid-cols-2">
                {myId != null ? (
                  <>
                    <Link
                      to={ROUTES.MANAGE_ADMIN_USERS(myId)}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/15 to-primary/5 px-5 py-4 text-left transition-all hover:border-primary/45 hover:shadow-[0_12px_40px_-16px_rgba(19,182,236,0.35)] hover:-translate-y-0.5"
                    >
                      <span className="flex items-center gap-4 min-w-0">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/25 text-primary ring-1 ring-primary/30">
                          <span className="material-symbols-outlined text-[24px]">group</span>
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-white truncate">{t('adminConsole.usersTitle')}</span>
                          <span className="block text-xs text-primary/70 mt-0.5">{t('adminConsole.overviewLinkUsersHint')}</span>
                        </span>
                      </span>
                      <span className="material-symbols-outlined text-gray-500 group-hover:text-primary transition-colors">
                        chevron_right
                      </span>
                    </Link>
                    <Link
                      to={ROUTES.MANAGE_ADMIN_REPORTS(myId)}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-white/[0.1] bg-white/[0.03] px-5 py-4 text-left transition-all hover:bg-white/[0.06] hover:border-amber-400/25 hover:shadow-[0_12px_40px_-16px_rgba(251,191,36,0.12)] hover:-translate-y-0.5"
                    >
                      <span className="flex items-center gap-4 min-w-0">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/20">
                          <span className="material-symbols-outlined text-[24px]">gavel</span>
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-white truncate">{t('adminConsole.reportsTitle')}</span>
                          <span className="block text-xs text-gray-500 mt-0.5 group-hover:text-gray-400">
                            {t('adminConsole.overviewLinkReportsHint')}
                          </span>
                        </span>
                      </span>
                      <span className="material-symbols-outlined text-gray-500 group-hover:text-amber-300/80 transition-colors">
                        chevron_right
                      </span>
                    </Link>
                  </>
                ) : null}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
