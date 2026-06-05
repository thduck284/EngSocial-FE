/**
 * Collect image URLs from community group posts (API field: `images`, not `media`).
 */
export function collectPostImages(posts = []) {
  const out = []
  for (const post of posts) {
    if (!post) continue
    const postId = post.id ?? post._id
    if (!postId) continue
    const urls = Array.isArray(post.images) ? post.images : []
    urls.forEach((url, imgIdx) => {
      if (typeof url !== 'string' || !url.trim()) return
      out.push({ url: url.trim(), postId, imgIdx, post })
    })
  }
  return out
}

export function getDocumentLabel(doc, url, index = 0) {
  if (doc && typeof doc === 'object' && doc.name?.trim()) return doc.name.trim()
  const fromUrl = url?.split('/').pop()?.split('?')[0]
  return fromUrl || `File ${index + 1}`
}

export function getDocumentFileIcon(nameOrUrl = '') {
  const s = String(nameOrUrl).toLowerCase()
  if (/\.(pdf)(\?|#|$)/.test(s)) return 'picture_as_pdf'
  if (/\.(doc|docx|rtf|odt)(\?|#|$)/.test(s)) return 'description'
  if (/\.(xls|xlsx|ods|csv)(\?|#|$)/.test(s)) return 'table_view'
  if (/\.(ppt|pptx|odp)(\?|#|$)/.test(s)) return 'present_to_all'
  if (/\.(txt|md)(\?|#|$)/.test(s)) return 'article'
  if (/\.(zip|rar|7z)(\?|#|$)/.test(s)) return 'folder_zip'
  return 'insert_drive_file'
}

export function getDocumentFileColor(nameOrUrl = '') {
  const s = String(nameOrUrl).toLowerCase()
  if (/\.(pdf)(\?|#|$)/.test(s)) return 'text-rose-500 bg-rose-500/10'
  if (/\.(doc|docx|rtf|odt)(\?|#|$)/.test(s)) return 'text-blue-500 bg-blue-500/10'
  if (/\.(xls|xlsx|ods|csv)(\?|#|$)/.test(s)) return 'text-emerald-500 bg-emerald-500/10'
  if (/\.(ppt|pptx|odp)(\?|#|$)/.test(s)) return 'text-orange-500 bg-orange-500/10'
  if (/\.(zip|rar|7z)(\?|#|$)/.test(s)) return 'text-amber-500 bg-amber-500/10'
  return 'text-slate-500 bg-slate-500/10'
}

/**
 * Office/docs attachments only (Word, PDF, Excel, …) from post.documents.
 */
export function collectPostDocuments(posts = []) {
  const out = []
  for (const post of posts) {
    if (!post) continue
    const postId = post.id ?? post._id
    if (!postId) continue

    const docs = Array.isArray(post.documents) ? post.documents : []
    docs.forEach((doc, docIndex) => {
      const url = typeof doc === 'string' ? doc : doc?.url
      if (typeof url !== 'string' || !url.trim()) return
      const name = getDocumentLabel(doc, url, docIndex)
      out.push({
        url: url.trim(),
        postId,
        docIndex,
        name,
        post,
      })
    })
  }
  return out
}

/** @deprecated Use collectPostDocuments */
export const collectPostFiles = collectPostDocuments
