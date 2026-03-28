import { useCallback } from 'react'
import { conversationService } from '../services'
import { showEngSuccessToast } from '../utils/showEngToast'

/**
 * Logic helper for PostShareModal:
 * - Copy post link + toast
 * - Send link to selected friends / groups via Messenger
 */
export function useSharePostActions({ t, postUrl, onClose }) {
  const showCopyToast = useCallback(() => {
    const msg =
      t('dashboard.linkCopied') || 'Đã copy link bài viết.'
    showEngSuccessToast(msg)
  }, [t])

  const showShareSuccessToast = useCallback(() => {
    const msg =
      t('dashboard.shareSuccess') || 'Chia sẻ bài viết thành công.'
    showEngSuccessToast(msg)
  }, [t])

  const handleCopyLink = useCallback(
    async (closeAfter = false) => {
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(postUrl)
        } else {
          const tmp = document.createElement('textarea')
          tmp.value = postUrl
          document.body.appendChild(tmp)
          tmp.select()
          document.execCommand('copy')
          document.body.removeChild(tmp)
        }
        showCopyToast()
      } catch {
        alert(t('dashboard.linkCopyFailed') || 'Copy link thất bại.')
        return
      }
      if (closeAfter) {
        onClose?.()
      }
    },
    [postUrl, showCopyToast, t, onClose]
  )

  const sendShareToTargets = useCallback(
    async (selectedFriendIds, selectedGroupIds) => {
      const linkText = t('dashboard.shareText') || 'Xem bài viết này:'
      const messageContent = `${linkText} ${postUrl}`

      // Gửi cho bạn bè (tạo hoặc lấy hội thoại trực tiếp)
      const friendIds = Array.from(selectedFriendIds || [])
      await Promise.all(
        friendIds.map(async (rawId) => {
          const id = String(rawId)
          const res = await conversationService.getOrCreateWithUser(id)
          const conv =
            res?.data?.conversation || res?.conversation || res?.data
          const convId = conv?.id ?? conv?._id
          if (!convId) return
          await conversationService.sendMessage(convId, messageContent)
        })
      )

      // Gửi vào group (dùng sẵn conversationId)
      const groupIds = Array.from(selectedGroupIds || [])
      await Promise.all(
        groupIds.map(async (rawId) => {
          const convId = String(rawId)
          if (!convId) return
          await conversationService.sendMessage(convId, messageContent)
        })
      )
      showShareSuccessToast()
    },
    [postUrl, showShareSuccessToast, t]
  )

  return { handleCopyLink, showCopyToast, sendShareToTargets }
}

