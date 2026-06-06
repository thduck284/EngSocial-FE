const previewCache = new Map()
const inflight = new Map()

function hostnameFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/**
 * @param {string} url
 * @returns {Promise<{ url: string, title: string, description: string, image: string, siteName: string } | null>}
 */
export async function fetchLinkPreview(url) {
  if (!url) return null
  if (previewCache.has(url)) return previewCache.get(url)

  if (inflight.has(url)) return inflight.get(url)

  const promise = (async () => {
    try {
      const res = await fetch(
        `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=false&video=false&audio=false`,
      )
      if (!res.ok) throw new Error('preview failed')
      const json = await res.json()
      const d = json?.data
      const preview = {
        url,
        title: String(d?.title || hostnameFromUrl(url)).trim(),
        description: String(d?.description || '').trim(),
        image: String(d?.image?.url || d?.logo?.url || '').trim(),
        siteName: String(d?.publisher || d?.author || hostnameFromUrl(url)).trim(),
        hostname: hostnameFromUrl(url),
        favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostnameFromUrl(url))}&sz=64`,
      }
      previewCache.set(url, preview)
      return preview
    } catch {
      const fallback = {
        url,
        title: hostnameFromUrl(url),
        description: '',
        image: '',
        siteName: hostnameFromUrl(url),
        hostname: hostnameFromUrl(url),
        favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostnameFromUrl(url))}&sz=64`,
      }
      previewCache.set(url, fallback)
      return fallback
    } finally {
      inflight.delete(url)
    }
  })()

  inflight.set(url, promise)
  return promise
}
