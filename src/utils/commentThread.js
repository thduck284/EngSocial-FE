/**
 * Sau khi gửi reply, xác định cần mở nhánh nào trong PostCommentsThread:
 * - rootId: comment gốc (cấp 0) → expandReplies(rootId) để thấy reply trực tiếp
 * - nestedAnchorId: comment con trực tiếp của root trong chuỗi → expandNestedReplies để thấy cấp 2+
 */
export function getExpandTargetsAfterReply(replyParentId, comments) {
  if (replyParentId == null || replyParentId === '') {
    return { rootId: null, nestedAnchorId: null }
  }
  const byId = new Map()
  for (const c of comments) {
    const id = c?.id ?? c?._id
    if (id) byId.set(String(id), c)
  }
  const pid = String(replyParentId)
  const parentNode = byId.get(pid)
  if (!parentNode) {
    return { rootId: pid, nestedAnchorId: null }
  }
  const pRaw =
    parentNode.parentId ??
    parentNode.parent_id ??
    (parentNode.parent && (parentNode.parent.id ?? parentNode.parent._id))
  if (pRaw == null || !byId.has(String(pRaw))) {
    return { rootId: pid, nestedAnchorId: null }
  }

  let child = pid
  while (true) {
    const n = byId.get(child)
    if (!n) return { rootId: null, nestedAnchorId: null }
    const pr = n.parentId ?? n.parent_id ?? (n.parent && (n.parent.id ?? n.parent._id))
    if (pr == null || !byId.has(String(pr))) {
      return { rootId: null, nestedAnchorId: null }
    }
    const parentComment = byId.get(String(pr))
    const gpr =
      parentComment.parentId ??
      parentComment.parent_id ??
      (parentComment.parent && (parentComment.parent.id ?? parentComment.parent._id))
    if (gpr == null || !byId.has(String(gpr))) {
      return { rootId: String(pr), nestedAnchorId: child }
    }
    child = String(pr)
  }
}
