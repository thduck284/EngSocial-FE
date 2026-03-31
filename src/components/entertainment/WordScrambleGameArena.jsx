import '../../styles/wordScrambleArena.css'

/** Vị trí % + delay (s) cho hạt sáng */
const SPARKLE_LAYOUT = [
  { l: 6, t: 8, d: 0 },
  { l: 18, t: 22, d: 0.4 },
  { l: 92, t: 12, d: 0.8 },
  { l: 78, t: 28, d: 1.2 },
  { l: 12, t: 45, d: 0.2 },
  { l: 88, t: 48, d: 1.6 },
  { l: 50, t: 6, d: 2.1 },
  { l: 34, t: 62, d: 0.6 },
  { l: 66, t: 58, d: 1.4 },
  { l: 8, t: 72, d: 2.4 },
  { l: 94, t: 78, d: 0.9 },
  { l: 42, t: 88, d: 1.8 },
  { l: 58, t: 82, d: 2.6 },
  { l: 24, t: 92, d: 0.3 },
  { l: 72, t: 14, d: 2.2 },
  { l: 52, t: 38, d: 1.0 },
  { l: 14, t: 34, d: 2.8 },
  { l: 86, t: 64, d: 0.5 },
  { l: 38, t: 18, d: 1.9 },
  { l: 62, t: 72, d: 2.3 },
]

/**
 * Vỏ visual riêng cho Word Scramble — không dùng palette dashboard.
 * @param {{ children: import('react').ReactNode, topBar?: import('react').ReactNode }} props
 */
export function WordScrambleGameArena({ children, topBar }) {
  return (
    <div className="ws-arena flex flex-col flex-1 min-h-0 w-full relative overflow-hidden">
      <div className="ws-arena__mesh" aria-hidden />
      <div className="ws-arena__grid" aria-hidden />
      <div className="ws-arena__scan" aria-hidden />
      <div className="ws-arena__orb ws-arena__orb--a" aria-hidden />
      <div className="ws-arena__orb ws-arena__orb--b" aria-hidden />
      <div className="ws-arena__orb ws-arena__orb--c" aria-hidden />
      {SPARKLE_LAYOUT.map((s, i) => (
        <span
          key={i}
          className="ws-sparkle"
          style={{
            left: `${s.l}%`,
            top: `${s.t}%`,
            animationDelay: `${s.d}s`,
          }}
          aria-hidden
        />
      ))}
      <div className="relative z-10 flex flex-col flex-1 min-h-0 mt-2">
        {topBar && (
          <div className="ws-topbar mx-1 sm:mx-2 mt-1 min-h-[50px] shrink-0">
            {topBar}
          </div>
        )}
        <div className="flex-1 min-h-0 flex flex-col px-2 sm:px-4 pb-3 pt-3 overflow-hidden justify-center">
          {children}
        </div>
      </div>
    </div>
  )
}
