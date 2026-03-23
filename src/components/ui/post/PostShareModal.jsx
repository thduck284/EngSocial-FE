import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { communityService } from '../../../services/community.service'
import { friendsService, conversationService } from '../../../services'
import { DEFAULT_AVATAR } from '../../../constants/ui'
import { useSharePostActions } from '../../../hooks/useSharePostActions'

export function PostShareModal({ open, onClose, post, t }) {
  const [activeTab, setActiveTab] = useState('repost') // 'repost' | 'external' | 'inapp'
  const [repostText, setRepostText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [audience, setAudience] = useState('onlyMe') // 'public' | 'friends' | 'onlyMe'
  const [audienceOpen, setAudienceOpen] = useState(false)
  const [friendsForShare, setFriendsForShare] = useState([])
  const [friendsForShareLoading, setFriendsForShareLoading] = useState(false)
  const [friendsPage, setFriendsPage] = useState(1)
  const [friendsHasMore, setFriendsHasMore] = useState(true)
  const [showMessengerGroupModal, setShowMessengerGroupModal] = useState(false)
  const [messengerGroups, setMessengerGroups] = useState([])
  const [messengerGroupsLoading, setMessengerGroupsLoading] = useState(false)
  const [messengerGroupSearch, setMessengerGroupSearch] = useState('')
  const [messengerModalMode, setMessengerModalMode] = useState('both') // 'both' | 'groupsOnly'
  const [selectedFriendIds, setSelectedFriendIds] = useState(new Set())
  const [selectedGroupIds, setSelectedGroupIds] = useState(new Set())

  const origin =
    typeof window !== 'undefined' && window.location
      ? window.location.origin
      : ''
  const postUrl = `${origin}/post/${post.id || post._id || ''}`

  const { handleCopyLink, sendShareToTargets } = useSharePostActions({
    t,
    postUrl,
    onClose,
  })

  const loadFriendsForShare = (page = 1, append = false) => {
    if (friendsForShareLoading) return
    setFriendsForShareLoading(true)
    friendsService
      .getList({ limit: 10, page })
      .then((res) => {
        const raw = res?.data?.data ?? res?.data ?? []
        const list = Array.isArray(raw) ? raw : []
        if (append) {
          setFriendsForShare((prev) => [...prev, ...list])
        } else {
          setFriendsForShare(list)
        }
        setFriendsHasMore(list.length >= 10)
        setFriendsPage(page)
      })
      .catch(() => {
        if (!append) setFriendsForShare([])
        setFriendsHasMore(false)
      })
      .finally(() => setFriendsForShareLoading(false))
  }

  useEffect(() => {
    if (!open) return
    setFriendsForShare([])
    setFriendsHasMore(true)
    loadFriendsForShare(1, false)
    setSelectedFriendIds(new Set())
    setSelectedGroupIds(new Set())
  }, [open])

  useEffect(() => {
    if (!showMessengerGroupModal || messengerGroups.length > 0) return
    setMessengerGroupsLoading(true)
    conversationService
      .getList()
      .then((res) => {
        const raw = res?.data
        const list = Array.isArray(raw)
          ? raw
          : raw?.data && Array.isArray(raw.data)
          ? raw.data
          : []
        const groups = list.filter(
          (c) => c.isGroup === true || c.type === 'group'
        )
        setMessengerGroups(groups)
      })
      .catch(() => setMessengerGroups([]))
      .finally(() => setMessengerGroupsLoading(false))
  }, [showMessengerGroupModal, messengerGroups.length])

  if (!open || !post) return null

  const handleRepost = async () => {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      const content = repostText.trim()

      await communityService.createPost({
        content,
        sharedPostId: post.id || post._id,
      })
      onClose?.()
    } catch (e) {
      setError(
        e?.message ||
          t('common.error') ||
          'Có lỗi xảy ra khi chia sẻ bài viết.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleExternalShare = () => {
    if (!origin) {
      handleCopyLink()
      return
    }
    const text =
      t('dashboard.shareText') ||
      'Xem bài viết này:'
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      postUrl
    )}&quote=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleInAppShare = () => {
    handleCopyLink()
    alert(
      t('dashboard.shareInAppHint') ||
        'Link bài viết đã được copy, bạn có thể dán vào chat hoặc nhóm.'
    )
  }

  const body = (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label={t('dashboard.share') || 'Chia sẻ bài viết'}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[550px] rounded-2xl bg-[#242526] text-white border border-[#3e4042] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với tiêu đề + nút X */}
        <div className="relative px-4 py-4 border-b border-[#3e4042] flex justify-center items-center">
          <h2 className="text-xl font-bold">
            {(() => {
              const raw = t('dashboard.sharePostTitle')
              return !raw || raw === 'dashboard.sharePostTitle'
                ? 'Chia sẻ'
                : raw
            })()}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 p-1 rounded-full hover:bg-[#3a3b3c]"
            aria-label={t('buttons.close') || 'Đóng'}
          >
            <span className="material-symbols-outlined text-[20px]">
              close
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto">
          {/* Khu nhập nội dung + thông tin user */}
          <div className="p-4 space-y-4">
            <div className="flex gap-3">
              <img
                src={post.author?.avatarUrl || post.author?.avatar || ''}
                alt={post.author?.name || 'avatar'}
                className="w-10 h-10 rounded-full object-cover bg-slate-500/40"
              />
              <div className="flex flex-col gap-1.5">
                <span className="text-[15px] font-semibold">
                  {post.author?.name || 'User'}
                </span>
                <div className="flex gap-2 flex-wrap relative">
                  {/* Audience visibility – button + dropdown menu */}
                  <button
                    type="button"
                    onClick={() => setAudienceOpen((v) => !v)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#3a3b3c] hover:bg-[#4e4f50] rounded-md text-[13px] font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {audience === 'public'
                        ? 'public'
                        : audience === 'friends'
                        ? 'group'
                        : 'lock'}
                    </span>
                    <span>
                      {audience === 'public'
                        ? t('dashboard.public') || 'Công khai'
                        : audience === 'friends'
                        ? t('dashboard.friendsOnly') || 'Bạn bè'
                        : t('dashboard.shareAudienceOnlyMe') || 'Chỉ mình tôi'}
                    </span>
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_drop_down
                    </span>
                  </button>

                  {audienceOpen && (
                    <div className="absolute z-10 top-full mt-1 right-0 w-48 rounded-lg bg-[#242526] border border-[#3e4042] shadow-lg py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAudience('public')
                          setAudienceOpen(false)
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-xs text-left hover:bg-[#3a3b3c] ${
                          audience === 'public' ? 'text-white' : 'text-[#e4e6eb]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          public
                        </span>
                        <span>{t('dashboard.public') || 'Công khai'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAudience('friends')
                          setAudienceOpen(false)
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-xs text-left hover:bg-[#3a3b3c] ${
                          audience === 'friends'
                            ? 'text-white'
                            : 'text-[#e4e6eb]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          group
                        </span>
                        <span>{t('dashboard.friendsOnly') || 'Bạn bè'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAudience('onlyMe')
                          setAudienceOpen(false)
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-xs text-left hover:bg-[#3a3b3c] ${
                          audience === 'onlyMe'
                            ? 'text-white'
                            : 'text-[#e4e6eb]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          lock
                        </span>
                        <span>
                          {t('dashboard.shareAudienceOnlyMe') || 'Chỉ mình tôi'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="relative group">
              <textarea
                rows={3}
                className="w-full bg-transparent border-none p-0 text-[18px] focus:ring-0 resize-none placeholder-[#b0b3b8] min-h-[80px]"
                placeholder={
                  t('dashboard.shareWriteSomething') ||
                  'Hãy nói gì đó về nội dung này...'
                }
                value={repostText}
                onChange={(e) => setRepostText(e.target.value)}
              />
              <button className="absolute bottom-2 right-0 text-[#b0b3b8] hover:text-white">
                <span className="material-symbols-outlined text-[24px]">
                  mood
                </span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleRepost}
                disabled={submitting}
                className="px-10 py-2 bg-[#0866ff] hover:bg-[#0866ff]/90 text-white rounded-lg text-[15px] font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting
                  ? t('dashboard.sharing') || 'Đang chia sẻ...'
                  : t('dashboard.shareNow') || 'Chia sẻ'}
              </button>
            </div>
          </div>

          <div className="border-t border-[#3e4042] mx-4" />

          {/* Gửi bằng Messenger */}
          <div className="p-4">
            <h3 className="text-[17px] font-bold mb-4">
              {t('dashboard.shareMessengerSection') || 'Gửi bằng Messenger'}
            </h3>
            <div className="relative group">
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 relative">
                {friendsForShareLoading ? (
                  <div className="flex items-center justify-center h-16 px-4 text-xs text-[#b0b3b8]">
                    <span className="material-symbols-outlined animate-spin text-[20px] mr-1">
                      progress_activity
                    </span>
                    {t('dashboard.loading') || 'Đang tải...'}
                  </div>
                ) : friendsForShare.length === 0 ? (
                  <div className="flex items-center justify-center h-16 px-4 text-xs text-[#b0b3b8]">
                    {t('dashboard.noFriendsOnline') || 'Chưa có bạn bè.'}
                  </div>
                ) : (
                  <>
                    {friendsForShare.map((item) => {
                      const u = item?.user || item
                      const name = u?.name || 'User'
                      const id = u?.id ?? u?._id
                      const avatar =
                        u?.avatar ||
                        (name
                          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              name
                            )}&background=13b6ec&color=fff`
                          : DEFAULT_AVATAR)
                      return (
                        <button
                          key={id || name}
                          type="button"
                          onClick={async () => {
                            if (!id) return
                            try {
                              const oneFriendSet = new Set([String(id)])
                              await sendShareToTargets(oneFriendSet, new Set())
                              onClose?.()
                            } catch (e) {
                              console.error(
                                'Failed to quick-share via Messenger',
                                e
                              )
                              alert(
                                t('dashboard.shareSendFailed') ||
                                  'Không gửi được link qua tin nhắn. Vui lòng thử lại.'
                              )
                            }
                          }}
                          className="flex flex-col items-center gap-1.5 min-w-[72px] text-center"
                        >
                          <img
                            src={avatar}
                            alt={name}
                            className="w-14 h-14 rounded-full border border-white/10 object-cover bg-[#3a3b3c]"
                          />
                          <span className="text-[12px] font-medium leading-tight truncate max-w-[72px]">
                            {name}
                          </span>
                        </button>
                      )
                    })}
                    {friendsForShare.length > 0 && friendsHasMore && (
                      <button
                        type="button"
                        disabled={friendsForShareLoading}
                        onClick={() =>
                          !friendsForShareLoading &&
                          loadFriendsForShare(friendsPage + 1, true)
                        }
                        className="flex flex-col items-center gap-1.5 min-w-[72px] text-center"
                      >
                        <div className="w-14 h-14 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] flex items-center justify-center cursor-pointer border border-white/10 transition-colors disabled:opacity-60">
                          <span className="material-symbols-outlined">
                            more_horiz
                          </span>
                        </div>
                        <span className="text-[12px] font-medium leading-tight">
                          {t('dashboard.shareDemoMore') || 'Xem thêm'}
                        </span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-[#3e4042] mx-4" />

          {/* Chia sẻ lên */}
          <div className="p-4">
            <h3 className="text-[17px] font-bold mb-4">
              {t('dashboard.shareExternal') || 'Chia sẻ lên'}
            </h3>
            <div className="flex flex-wrap gap-8 text-[12px] text-[#b0b3b8]">
              {/* Messenger */}
              <button
                type="button"
                onClick={() => {
                  setMessengerModalMode('both')
                  setShowMessengerGroupModal(true)
                }}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 bg-[#3a3b3c] rounded-full flex items-center justify-center hover:bg-[#4e4f50] transition-colors">
                  <span className="material-symbols-outlined text-[24px]">
                    chat_bubble
                  </span>
                </div>
                <span className="group-hover:text-white">Messenger</span>
              </button>

              {/* Sao chép liên kết */}
              <button
                type="button"
                onClick={() => handleCopyLink(true)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 bg-[#3a3b3c] rounded-full flex items-center justify-center hover:bg-[#4e4f50] transition-colors">
                  <span className="material-symbols-outlined text-[24px]">
                    link
                  </span>
                </div>
                <span className="group-hover:text-white text-center leading-tight">
                  {t('dashboard.shareCopyLink') || 'Sao chép liên kết'}
                </span>
              </button>

              {/* Nhóm */}
              <button
                type="button"
                onClick={() => {
                  setMessengerModalMode('groupsOnly')
                  setShowMessengerGroupModal(true)
                }}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 bg-[#3a3b3c] rounded-full flex items-center justify-center hover:bg-[#4e4f50] transition-colors">
                  <span className="material-symbols-outlined text-[24px]">
                    groups
                  </span>
                </div>
                <span className="group-hover:text-white">Nhóm</span>
              </button>
            </div>
          </div>

          {error ? (
            <p className="px-4 pb-3 text-xs text-red-400 whitespace-pre-wrap break-words">
              {error}
            </p>
          ) : null}
        </div>

        {/* Footer chỉ có nút Hủy để đóng modal */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#3e4042]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#e4e6eb] bg-[#3a3b3c] hover:bg-[#4e4f50]"
          >
            {t('buttons.cancel') || 'Hủy'}
          </button>
        </div>
      </div>
    </div>
  )

  const messengerGroupsBody = showMessengerGroupModal ? (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-[#242526] text-white border border-[#3e4042] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3e4042]">
          <h3 className="text-base font-semibold">
            {t('dashboard.shareMessengerSection') || 'Send via Messenger'}
          </h3>
          <button
            type="button"
            onClick={() => setShowMessengerGroupModal(false)}
            className="p-1 rounded-full hover:bg-[#3a3b3c]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="px-4 pt-3 pb-4 space-y-3">
          <div>
            <input
              type="text"
              value={messengerGroupSearch}
              onChange={(e) => setMessengerGroupSearch(e.target.value)}
              placeholder={(() => {
                const raw = t('dashboard.searchGroupsPlaceholder')
                return !raw || raw === 'dashboard.searchGroupsPlaceholder'
                  ? 'Tìm kiếm bạn bè / group để gửi...'
                  : raw
              })()}
              className="w-full rounded-lg bg-[#3a3b3c] border border-[#4e4f50] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0866ff]"
            />
          </div>

          {messengerGroupsLoading ? (
            <div className="flex items-center justify-center py-6 text-sm text-[#b0b3b8]">
              <span className="material-symbols-outlined animate-spin text-[20px] mr-2">
                progress_activity
              </span>
              {t('dashboard.loading') || 'Đang tải...'}
            </div>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {(() => {
                const keyword = messengerGroupSearch.trim().toLowerCase()
                const groupsFiltered = messengerGroups.filter((g) => {
                  if (!keyword) return true
                  const name = g?.name || ''
                  return name.toLowerCase().includes(keyword)
                })
                const friendsFiltered = friendsForShare.filter((item) => {
                  const u = item?.user || item
                  if (!u) return false
                  if (!keyword) return true
                  const name = u?.name || ''
                  return name.toLowerCase().includes(keyword)
                })

                const showFriendsSection = messengerModalMode === 'both'
                const friendList = showFriendsSection
                  ? friendsFiltered.slice(0, 5)
                  : []
                const groupList = groupsFiltered.slice(0, 5)

                if (friendList.length === 0 && groupList.length === 0) {
                  return (
                    <p className="text-xs text-[#b0b3b8] py-4 text-center">
                      {t('dashboard.noStudyGroups') || 'Không có kết quả phù hợp.'}
                    </p>
                  )
                }

                return (
                  <>
                    {friendList.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-wide text-[#b0b3b8]">
                          {t('dashboard.friends') || 'Friends'}
                        </p>
                        {friendList.map((item) => {
                          const u = item?.user || item
                          const name = u?.name || 'User'
                          const id = u?.id ?? u?._id
                          const avatar =
                            u?.avatar ||
                            (name
                              ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  name
                                )}&background=13b6ec&color=fff`
                              : DEFAULT_AVATAR)
                          const isSelected =
                            id != null && selectedFriendIds.has(String(id))
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => {
                                if (id == null) return
                                setSelectedFriendIds((prev) => {
                                  const next = new Set(prev)
                                  const key = String(id)
                                  if (next.has(key)) next.delete(key)
                                  else next.add(key)
                                  return next
                                })
                              }}
                              className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors ${
                                isSelected
                                  ? 'bg-[#3a3b3c] border border-[#4e4f50]'
                                  : 'hover:bg-[#3a3b3c]'
                              }`}
                            >
                              <img
                                src={avatar}
                                alt={name}
                                className="w-9 h-9 rounded-full object-cover bg-[#3a3b3c]"
                              />
                              <p className="text-sm font-medium truncate">{name}</p>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {groupList.length > 0 && (
                      <div className="space-y-1 mt-3">
                        <p className="text-[11px] uppercase tracking-wide text-[#b0b3b8]">
                          {t('dashboard.studyGroups') || 'Groups'}
                        </p>
                        {groupList.map((g) => {
                          const name = g?.name || 'Group'
                          const id = g?.id ?? g?._id
                          const avatar =
                            g?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              name
                            )}&background=13b6ec&color=fff`
                          const isSelected =
                            id != null && selectedGroupIds.has(String(id))
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => {
                                if (id == null) return
                                setSelectedGroupIds((prev) => {
                                  const next = new Set(prev)
                                  const key = String(id)
                                  if (next.has(key)) next.delete(key)
                                  else next.add(key)
                                  return next
                                })
                              }}
                              className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors ${
                                isSelected
                                  ? 'bg-[#3a3b3c] border border-[#4e4f50]'
                                  : 'hover:bg-[#3a3b3c]'
                              }`}
                            >
                              <img
                                src={avatar}
                                alt={name}
                                className="w-9 h-9 rounded-full object-cover bg-[#3a3b3c]"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {name}
                                </p>
                                {g.memberCount != null && (
                                  <p className="text-[11px] text-[#b0b3b8]">
                                    {g.memberCount}{' '}
                                    {t('dashboard.members') || 'thành viên'}
                                  </p>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowMessengerGroupModal(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#e4e6eb] bg-[#3a3b3c] hover:bg-[#4e4f50]"
            >
              {t('buttons.cancel') || 'Hủy'}
            </button>
            <button
              type="button"
              disabled={
                selectedFriendIds.size === 0 && selectedGroupIds.size === 0
              }
              onClick={async () => {
                try {
                  await sendShareToTargets(
                    selectedFriendIds,
                    selectedGroupIds
                  )
                  setShowMessengerGroupModal(false)
                } catch (e) {
                  console.error('Failed to send share link via Messenger', e)
                  alert(
                    t('dashboard.shareSendFailed') ||
                      'Không gửi được link qua tin nhắn. Vui lòng thử lại.'
                  )
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0866ff] hover:bg-[#0866ff]/90 disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {t('messages.send') || 'Gửi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null

  return createPortal(
    <>
      {body}
      {messengerGroupsBody}
    </>,
    document.body
  )
}

