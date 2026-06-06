export const MAIN_SCROLL_SELECTOR = '[data-app-main-scroll]'

export function getMainScrollElement() {
  return document.querySelector(MAIN_SCROLL_SELECTOR)
}

export function captureMainScrollY() {
  const el = getMainScrollElement()
  return el ? el.scrollTop : window.scrollY
}

export function restoreMainScrollY(scrollY) {
  if (scrollY == null || scrollY < 0) return
  requestAnimationFrame(() => {
    const el = getMainScrollElement()
    if (el) el.scrollTop = scrollY
    else window.scrollTo(0, scrollY)
  })
}
