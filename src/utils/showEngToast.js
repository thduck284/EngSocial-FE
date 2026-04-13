const TOAST_ID = 'eng-app-toast'
const DEFAULT_DURATION_MS = 2200

/**
 * Toast nhỏ giữa đáy màn hình (tick xanh + text), tự ẩn — dùng chung với copy/chia sẻ bài viết.
 * @param {string} message
 * @param {number} [durationMs]
 */
export function showEngSuccessToast(message, durationMs = DEFAULT_DURATION_MS) {
  if (typeof message !== 'string' || !message.trim()) return
  try {
    const existing = document.getElementById(TOAST_ID)
    if (existing) existing.remove()
    const el = document.createElement('div')
    el.id = TOAST_ID
    el.setAttribute('role', 'status')
    el.setAttribute('aria-live', 'polite')
    el.className =
      'fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] px-4 py-3 rounded-2xl bg-[#1f2933] text-white text-sm shadow-xl flex items-center gap-2.5 max-w-[min(90vw,400px)]'
    const icon = document.createElement('span')
    icon.className = 'material-symbols-outlined shrink-0'
    icon.style.fontSize = '18px'
    icon.style.color = '#22c55e'
    icon.textContent = 'check_circle'
    const text = document.createElement('span')
    text.className = 'font-semibold text-center leading-snug whitespace-normal'
    text.textContent = message
    el.appendChild(icon)
    el.appendChild(text)
    document.body.appendChild(el)
    window.setTimeout(() => {
      el.remove()
    }, durationMs)
  } catch {
    /* ignore */
  }
}

/**
 * Toast nhỏ giữa đáy màn hình (icon đỏ + text), tự ẩn — thông báo lỗi.
 * @param {string} message
 * @param {number} [durationMs]
 */
export function showEngErrorToast(message, durationMs = DEFAULT_DURATION_MS) {
  if (typeof message !== 'string' || !message.trim()) return
  try {
    const existing = document.getElementById(TOAST_ID)
    if (existing) existing.remove()
    const el = document.createElement('div')
    el.id = TOAST_ID
    el.setAttribute('role', 'alert')
    el.setAttribute('aria-live', 'assertive')
    el.className =
      'fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] px-4 py-3 rounded-2xl bg-[#1f2933] text-white text-sm shadow-xl flex items-center gap-2.5 max-w-[min(90vw,400px)]'
    const icon = document.createElement('span')
    icon.className = 'material-symbols-outlined shrink-0'
    icon.style.fontSize = '18px'
    icon.style.color = '#ef4444'
    icon.textContent = 'error'
    const text = document.createElement('span')
    text.className = 'font-semibold text-center leading-snug whitespace-normal'
    text.textContent = message
    el.appendChild(icon)
    el.appendChild(text)
    document.body.appendChild(el)
    window.setTimeout(() => {
      el.remove()
    }, durationMs)
  } catch {
    /* ignore */
  }
}
