/**
 * Giphy API for message GIF picker. Requires VITE_GIPHY_API_KEY.
 */

const API_KEY = import.meta.env.VITE_GIPHY_API_KEY || ''

export const hasGiphyKey = Boolean(API_KEY && API_KEY !== 'dc6zaTOxFJmzC')

export async function searchGiphy(query) {
  if (!hasGiphyKey) return []
  const url = query.trim()
    ? `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(query.trim())}&limit=20&rating=g`
    : `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=20&rating=g`
  const res = await fetch(url)
  if (!res.ok) return []
  const json = await res.json()
  return (json.data || [])
    .map((g) => ({
      id: g.id,
      url: g.images?.fixed_height?.url || g.images?.original?.url || g.url,
      preview: g.images?.fixed_height_small?.url || g.images?.fixed_height?.url,
    }))
    .filter((g) => g.url)
}
