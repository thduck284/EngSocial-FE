import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const DEFAULT_MAX_HEIGHT = 324
const VIEWPORT_GAP = 8

function getHeaderBottom() {
  const header = document.querySelector('header')
  return header ? header.getBoundingClientRect().bottom : 0
}

/**
 * Select tùy chỉnh — mở lên/xuống tự động, max-height không vượt qua bottom header.
 */
export function CompactSelect({
  value,
  onChange,
  options,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  itemClassName = '',
  placement = 'auto',
  clampToHeader = true,
  /** Menu rộng bằng root (pill gồm icon + label) thay vì chỉ nút bên trong */
  matchRootWidth = false,
  leading = null,
  size = 'md',
}) {
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState(null)

  const selected = options.find((o) => o.value === value) || options[0]
  const isSm = size === 'sm'

  const updateMenuPosition = () => {
    const anchor = (matchRootWidth ? rootRef.current : buttonRef.current) || buttonRef.current
    if (!anchor) return

    const rect = anchor.getBoundingClientRect()
    const headerBottom = clampToHeader ? getHeaderBottom() : 0
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_GAP
    const spaceAbove = rect.top - headerBottom - VIEWPORT_GAP

    let openUp = placement === 'up'
    if (placement === 'auto') {
      openUp = spaceBelow < 180 || spaceAbove > spaceBelow
    }
    if (placement === 'down') openUp = false

    const available = openUp ? spaceAbove : spaceBelow
    const maxHeight = Math.min(DEFAULT_MAX_HEIGHT, Math.max(0, available))

    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      maxHeight,
      zIndex: 9999,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + VIEWPORT_GAP }
        : { top: rect.bottom + VIEWPORT_GAP }),
    })
  }

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null)
      return
    }
    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)
    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [open, placement, clampToHeader, options.length, matchRootWidth])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (rootRef.current?.contains(e.target)) return
      if (menuRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const menu =
    open && menuStyle
      ? createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            style={menuStyle}
            className={`overflow-y-auto custom-scrollbar rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark shadow-lg py-1 ${menuClassName}`}
          >
            {options.map((opt) => {
              const active = opt.value === value
              return (
                <li key={opt.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value)
                      setOpen(false)
                    }}
                    className={`w-full text-left truncate transition-colors ${
                      isSm ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
                    } ${
                      active
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                    } ${itemClassName}`}
                    title={opt.label}
                  >
                    {opt.label}
                  </button>
                </li>
              )
            })}
          </ul>,
          document.body
        )
      : null

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center justify-between border border-slate-200 dark:border-border-dark rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all ${
          isSm ? 'gap-1 px-2 py-0.5 text-xs' : 'gap-2 w-full px-3 py-2 text-sm'
        } ${buttonClassName}`}
      >
        <span className="inline-flex items-center gap-1 min-w-0">
          {leading ? <span className="shrink-0 inline-flex items-center">{leading}</span> : null}
          <span className="truncate">{selected?.label}</span>
        </span>
        <span className={`material-symbols-outlined text-slate-400 shrink-0 ${isSm ? 'text-[14px]' : 'text-base'}`}>
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      {menu}
    </div>
  )
}
