import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DEFAULT_AVATAR } from '../../../constants/ui'
import { POST_REACTION_TYPES, REACTION_TYPE_TO_EMOJI } from '../../../constants'
import { formatPostTime } from '../../../utils/dateTime'
import { formatReactionCount } from '../../../utils/post'

export function PostCommentsThread({
  isModal,
  t,
  comments,
  handleFeedCommentLikeMouseEnter,
  handleFeedCommentLikeMouseLeave,
  handleFeedCommentLikeFocus,
  handleFeedCommentLikeBlur,
  handleToggleCommentLike,
  setCommentReactionsModalCommentId,
  setCommentReactionsModalInitialTab,
  setShowCommentReactionsModal,
  startReplyToComment,
  threadPages = {},
  loadMoreThreadComments,
}) {
  const [expandedIds, setExpandedIds] = useState([])
  const [expandedReplyIds, setExpandedReplyIds] = useState([])
  const navigate = useNavigate()

  const isExpanded = (id) => expandedIds.includes(id)
  const isReplyExpanded = (id) => expandedReplyIds.includes(id)
  const expandReplies = (id) =>
    setExpandedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  const expandNestedReplies = (id) =>
    setExpandedReplyIds((prev) => (prev.includes(id) ? prev : [...prev, id]))

  const byId = new Map()
  const childrenMap = new Map()

  comments.forEach((c) => {
    const cid = c?.id ?? c?._id
    if (!cid) return
    byId.set(String(cid), c)
  })

  comments.forEach((c) => {
    const cid = c?.id ?? c?._id
    if (!cid) return
    const parentIdRaw =
      c.parentId ??
      c.parent_id ??
      (c.parent && (c.parent.id ?? c.parent._id)) ??
      null
    const parentKey = parentIdRaw != null ? String(parentIdRaw) : null
    if (!parentKey || !byId.has(parentKey)) return
    if (!childrenMap.has(parentKey)) childrenMap.set(parentKey, [])
    childrenMap.get(parentKey).push(c)
  })

  const roots = comments.filter((c) => {
    const cid = c?.id ?? c?._id
    if (!cid) return false
    const parentIdRaw =
      c.parentId ??
      c.parent_id ??
      (c.parent && (c.parent.id ?? c.parent._id)) ??
      null
    if (!parentIdRaw) return true
    return !byId.has(String(parentIdRaw))
  })

  const collectAllDescendants = (parentKey) => {
    const result = []
    const collect = (key) => {
      const children = childrenMap.get(key) || []
      children.forEach((child) => {
        const childId = child?.id ?? child?._id
        if (!childId) return
        result.push(child)
        collect(String(childId))
      })
    }
    collect(parentKey)
    return result
  }

  const getCommentParts = (c) => {
    const cid = c?.id ?? c?._id
    const cauthor = c?.author ?? {}
    const avatar =
      cauthor.avatar ||
      (cauthor.name
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(cauthor.name)}&background=13b6ec&color=fff`
        : DEFAULT_AVATAR)
    const imgs = Array.isArray(c?.images)
      ? c.images.filter((u) => typeof u === 'string' && u.trim())
      : []
    const docs = Array.isArray(c?.documents)
      ? c.documents.filter((d) => d && d.url)
      : []
    return { cid, cauthor, avatar, imgs, docs }
  }

  const viewMoreLabel = (count) => {
    const translated = t('dashboard.viewAllReplies', { count })
    if (!translated || translated === 'dashboard.viewAllReplies') {
      return `Xem tất cả ${count} phản hồi`
    }
    return translated
  }

  const renderContentWithMentions = (text, comment) => {
    if (!text) return null
    const parts = String(text).split(/(@[^\s@]+(?:\s+[^\s@]+)?)/g)
    return parts.map((part, idx) => {
      if (!part) return null
      if (part.startsWith('@') && part.length > 1) {
        return (
          <button
            key={idx}
            type="button"
            className="font-semibold text-sky-500 hover:underline"
            onClick={() => {
              const authorId =
                comment?.author?.id ??
                comment?.authorId ??
                comment?.author?._id ??
                null
              if (!authorId) return
              navigate(`/profile/${authorId}`)
            }}
          >
            {part}
          </button>
        )
      }
      return <span key={idx}>{part}</span>
    })
  }

  // ── Bubble ──
  const renderBubble = (c, imgs, docs) => (
    <div
      className={
        isModal
          ? 'rounded-xl bg-[#242526] border border-[#325a67] px-3 py-2'
          : 'rounded-xl bg-slate-50 dark:bg-[#242526] border border-slate-200 dark:border-[#325a67] px-3 py-2'
      }
    >
      <span
        className={
          isModal
            ? 'text-sm font-semibold text-slate-100 truncate block'
            : 'text-sm font-semibold text-slate-900 dark:text-slate-100 truncate block'
        }
      >
        {(c?.author ?? {}).name || 'User'}
      </span>
      {c?.content ? (
        <p
          className={
            isModal
              ? 'mt-0.5 text-sm text-slate-200 whitespace-pre-wrap break-words'
              : 'mt-0.5 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words'
          }
        >
          {renderContentWithMentions(c.content, c)}
        </p>
      ) : null}
      {imgs.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-1">
          {imgs.slice(0, 9).map((url, i) => (
            <img
              key={`${url}-${i}`}
              src={url}
              alt=""
              className={
                isModal
                  ? 'w-full aspect-square object-cover rounded-lg border border-[#325a67]'
                  : 'w-full aspect-square object-cover rounded-lg border border-slate-200 dark:border-[#325a67]'
              }
              referrerPolicy="no-referrer"
            />
          ))}
        </div>
      )}
      {c?.video ? (
        <div className="mt-2">
          <video
            src={c.video}
            controls
            className={
              isModal
                ? 'w-full max-h-48 rounded-lg border border-[#325a67] bg-black/30'
                : 'w-full max-h-48 rounded-lg border border-slate-200 dark:border-[#325a67] bg-black/10 dark:bg-black/30'
            }
            preload="metadata"
          />
        </div>
      ) : null}
      {c?.audio ? (
        <div className="mt-2">
          <audio src={c.audio} controls className="w-full" preload="metadata" />
        </div>
      ) : null}
      {docs.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {docs.map((d, i) => (
            <a
              key={`${d.url}-${i}`}
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className={
                isModal
                  ? 'inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#233f48] text-sm font-medium text-primary hover:underline border border-[#325a67]'
                  : 'inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#233f48] text-sm font-medium text-primary hover:underline border border-slate-200 dark:border-[#325a67]'
              }
              title={d.name || undefined}
            >
              <span className="material-symbols-outlined text-lg shrink-0">description</span>
              <span className="truncate">
                {d.name || (t('dashboard.document') || 'Tài liệu')}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  )

  // ── Action bar ──
  const renderActions = (c, cid, cauthor) => (
    <div className="flex items-center justify-between gap-2 px-1 pt-1">
      <div
        className={
          isModal
            ? 'flex items-center gap-3 text-xs text-[#92bbc9]'
            : 'flex items-center gap-3 text-xs text-slate-500 dark:text-[#92bbc9]'
        }
      >
        <span className="shrink-0">{formatPostTime(c?.createdAt)}</span>
        <button
          type="button"
          onMouseEnter={(e) => handleFeedCommentLikeMouseEnter?.(cid, e.currentTarget)}
          onMouseLeave={handleFeedCommentLikeMouseLeave}
          onFocus={(e) => {
            if (e.detail === 0) handleFeedCommentLikeFocus?.(cid, e.currentTarget)
          }}
          onBlur={handleFeedCommentLikeBlur}
          onClick={() => handleToggleCommentLike(cid)}
          className={
            isModal
              ? `font-semibold hover:underline ${c?.liked ? 'text-primary' : 'text-[#92bbc9]'}`
              : `font-semibold hover:underline ${c?.liked ? 'text-primary' : ''}`
          }
        >
          {c?.userReaction
            ? t(
                `dashboard.reaction${
                  String(c.userReaction).charAt(0).toUpperCase() +
                  String(c.userReaction).slice(1)
                }`
              ) || (t('dashboard.like') || 'Thích')
            : t('dashboard.like') || 'Thích'}
        </button>
        <button
          type="button"
          className={
            isModal
              ? 'font-semibold hover:underline text-[#92bbc9]'
              : 'font-semibold hover:underline'
          }
          onClick={() => startReplyToComment?.(cid, cauthor)}
        >
          {t('dashboard.reply') || 'Trả lời'}
        </button>
      </div>
      {Number(c?.likeCount) > 0 && (
        <button
          type="button"
          onClick={() => {
            setCommentReactionsModalCommentId?.(cid)
            setCommentReactionsModalInitialTab?.('all')
            setShowCommentReactionsModal?.(true)
          }}
          className={
            isModal
              ? `inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs shrink-0 ${
                  c?.liked
                    ? 'bg-primary text-white border-primary'
                    : 'bg-[#233f48] text-slate-100 border-[#325a67]'
                }`
              : `inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs shrink-0 ${
                  c?.liked
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-[#233f48] text-slate-700 dark:text-slate-100 border-slate-200 dark:border-[#325a67]'
                }`
          }
        >
          <span className="flex items-center -space-x-1" aria-hidden>
            {POST_REACTION_TYPES.filter(
              (type) => c?.reactionCounts && c.reactionCounts[type] > 0
            ).map((reactionType) => (
              <span
                key={reactionType}
                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-transparent"
              >
                {REACTION_TYPE_TO_EMOJI[reactionType]}
              </span>
            ))}
          </span>
          <span className="tabular-nums">{formatReactionCount(c.likeCount)}</span>
        </button>
      )}
    </div>
  )

  /**
   * ConnectorAvatar — vẽ dây nối chữ L + avatar cho cấp 1 và cấp 2+.
   *
   * Cấu trúc:
   *   ┃          ← đường dọc (từ trên, nối với avatar cha)
   *   ┗━━ [avatar]  ← đường ngang rồi avatar
   *   ┃          ← đường dọc tiếp (nếu không phải item cuối)
   *
   * @param {string}  avatar      - URL avatar
   * @param {number}  avatarSize  - kích thước avatar (px), mặc định 28
   * @param {boolean} isLast      - true nếu đây là item cuối, không kéo dây tiếp xuống
   * @param {boolean} isModal
   */
  const ConnectorAvatar = ({ avatar, avatarSize = 28, isLast = false, isModal }) => {
    // Khoảng cách từ trái: đường dọc nằm ở x=0, đường ngang dài connectorW, rồi đến avatar
    const connectorW = 16   // chiều dài đường ngang
    const radius = 8        // bán kính bo cong góc
    const totalW = connectorW + avatarSize
    // Tâm avatar theo chiều dọc = cách top bằng nửa avatarSize (canh giữa)
    const avatarCenterY = avatarSize / 2
    const lineColor = isModal
      ? 'rgba(148,163,184,0.35)'   // slate-400/35 trên nền dark
      : 'rgba(100,116,139,0.3)'    // slate-500/30 trên nền light

    return (
      <div
        className="shrink-0 relative self-stretch"
        style={{ width: totalW, minHeight: avatarSize }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${totalW} 100`}
          preserveAspectRatio="none"
          aria-hidden
        >
          {/* Đường dọc từ top xuống tới điểm bắt đầu bo cong */}
          <line
            x1={1} y1={0}
            x2={1} y2={avatarCenterY - radius}
            stroke={lineColor} strokeWidth={2} vectorEffect="non-scaling-stroke"
          />
          {/* Bo cong góc + đường ngang sang avatar */}
          <path
            d={`M 1 ${avatarCenterY - radius} Q 1 ${avatarCenterY} ${1 + radius} ${avatarCenterY}`}
            fill="none"
            stroke={lineColor} strokeWidth={2} vectorEffect="non-scaling-stroke"
          />
          <line
            x1={1 + radius} y1={avatarCenterY}
            x2={connectorW}  y2={avatarCenterY}
            stroke={lineColor} strokeWidth={2} vectorEffect="non-scaling-stroke"
          />
          {/* Đường dọc phía dưới (nếu không phải item cuối) */}
          {!isLast && (
            <line
              x1={1} y1={avatarCenterY}
              x2={1} y2={100}
              stroke={lineColor} strokeWidth={2} vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {/* Avatar */}
        <img
          src={avatar}
          alt=""
          style={{
            position: 'absolute',
            left: connectorW,
            top: 0,
            width: avatarSize,
            height: avatarSize,
          }}
          className={
            isModal
              ? 'rounded-full object-cover bg-slate-600'
              : 'rounded-full object-cover bg-slate-300 dark:bg-slate-600'
          }
        />
      </div>
    )
  }

  // ── Cấp 2+ (flat replies, đồng cấp với cấp 1, không thụt thêm) ──
  const renderNestedReply = (c, isLast = false) => {
    const { cid, cauthor, avatar, imgs, docs } = getCommentParts(c)
    return (
      <div key={cid || Math.random()} className="flex gap-2">
        <ConnectorAvatar
          avatar={avatar}
          avatarSize={28}
          isLast={isLast}
          isModal={isModal}
        />
        <div className="min-w-0 flex-1 pb-1">
          {renderBubble(c, imgs, docs)}
          {renderActions(c, cid, cauthor)}
        </div>
      </div>
    )
  }

  // ── Cấp 1 ──
  const renderReply = (c, isLast = false) => {
    const { cid, cauthor, avatar, imgs, docs } = getCommentParts(c)
    const key = String(cid)
    const nested = collectAllDescendants(key) // tất cả reply đã có trong state
    const expanded = isReplyExpanded(key)
    const hasNested = nested.length > 0

    const totalCount =
      typeof c?.replyCount === 'number' ? c.replyCount : nested.length

    const meta =
      threadPages?.[key] || { page: 1, hasMore: totalCount > nested.length }

    const getReplyButtonLabel = () => {
      if (totalCount <= 5) {
        // ≤ 5 phản hồi → luôn "Xem tất cả xx phản hồi"
        return viewMoreLabel(totalCount)
      }
      if (meta.hasMore) {
        // > 5 và còn load thêm từ backend → "Xem thêm phản hồi"
        return t('dashboard.viewMoreReplies') || 'Xem thêm phản hồi'
      }
      // > 5 nhưng đã load hết → "Xem tất cả xx phản hồi"
      return viewMoreLabel(totalCount)
    }

    return (
      <div key={cid || Math.random()} className="flex gap-2">
        <ConnectorAvatar
          avatar={avatar}
          avatarSize={28}
          // Kéo dây tiếp nếu có nested replies đang hiển thị hoặc còn nút xem thêm
          isLast={isLast && !hasNested}
          isModal={isModal}
        />
        <div className="min-w-0 flex-1 pb-1">
          {renderBubble(c, imgs, docs)}
          {renderActions(c, cid, cauthor)}

          {hasNested && (
            <div className="mt-1 flex flex-col gap-1">
              {expanded &&
                nested.map((child, idx) =>
                  renderNestedReply(child, idx === nested.length - 1)
                )}

              {totalCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (!expanded) {
                      // lần đầu: bung reply đã có
                      expandNestedReplies(key)
                    } else if (meta.hasMore) {
                      // sau đó: mỗi lần bấm load thêm 10 reply
                      loadMoreThreadComments?.(cid)
                    }
                  }}
                  className={
                    isModal
                      ? 'mt-0.5 text-xs text-[#92bbc9] hover:underline text-left'
                      : 'mt-0.5 text-xs text-slate-500 dark:text-[#92bbc9] hover:underline text-left'
                  }
                >
                  {getReplyButtonLabel()}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Cấp 0 (root) — avatar 32px, đường dọc dưới avatar khi expanded ──
  const renderRoot = (c) => {
    const { cid, cauthor, avatar, imgs, docs } = getCommentParts(c)
    const key = String(cid)
    const directReplies = childrenMap.get(key) || []
    const replyCountFromServer = typeof c?.replyCount === 'number' ? c.replyCount : 0
    const displayCount = directReplies.length || replyCountFromServer
    const hasReplies = displayCount > 0
    const expanded = isExpanded(key)

    return (
      <div key={cid || Math.random()} className="flex gap-2">
        {/* Cột avatar cấp 0 + đường dọc khi expanded */}
        <div className="shrink-0 flex flex-col items-center" style={{ width: 32 }}>
          <img
            src={avatar}
            alt=""
            className={
              isModal
                ? 'size-8 rounded-full object-cover bg-slate-600'
                : 'size-8 rounded-full object-cover bg-slate-300 dark:bg-slate-600'
            }
          />
          {/* Đường dọc nối xuống vùng replies */}
          {hasReplies && expanded && (
            <div
              className="flex-1 mt-1"
              style={{
                width: 2,
                background: isModal
                  ? 'rgba(148,163,184,0.35)'
                  : 'rgba(100,116,139,0.3)',
              }}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {renderBubble(c, imgs, docs)}
          {renderActions(c, cid, cauthor)}

          {hasReplies && (
            <div className="mt-1 flex flex-col gap-1">
              {expanded &&
                directReplies.map((child, idx) =>
                  renderReply(child, idx === directReplies.length - 1)
                )}
              {!expanded && (
                <button
                  type="button"
                  onClick={() => expandReplies(key)}
                  className={
                    isModal
                      ? 'mt-0.5 text-xs text-[#92bbc9] hover:underline text-left'
                      : 'mt-0.5 text-xs text-slate-500 dark:text-[#92bbc9] hover:underline text-left'
                  }
                >
                  {viewMoreLabel(displayCount)}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!roots.length) {
    return comments.map((c) => renderRoot(c))
  }

  return roots.map((c) => renderRoot(c))
}