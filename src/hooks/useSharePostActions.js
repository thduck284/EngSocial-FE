import { useCallback } from 'react'
import { conversationService } from '../services'

/**
 * Logic helper for PostShareModal:
 * - Copy post link + toast
 * - Send link to selected friends / groups via Messenger
 */
export function useSharePostActions({ t, postUrl, onClose }) {
  const showToast = useCallback(
    (message) => {
      try {
        const existing = document.getElementById('eng-copy-toast')
        if (existing) existing.remove()
        const el = document.createElement('div')
        el.id = 'eng-copy-toast'
        el.className =
          'fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-full bg-[#1f2933] text-white text-sm shadow-xl flex items-center gap-2'
        el.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;color:#22c55e">check_circle</span><span style="font-weight:600">${message}</span>`
        document.body.appendChild(el)
        setTimeout(() => {
          el.remove()
        }, 2000)
      } catch {
        // ignore toast errors
      }
    },
    []
  )

  const showCopyToast = useCallback(() => {
    const msg =
      t('dashboard.linkCopied') || 'Đã copy link bài viết.'
    showToast(msg)
  }, [showToast, t])

  const showShareSuccessToast = useCallback(() => {
    const msg =
      t('dashboard.shareSuccess') || 'Chia sẻ bài viết thành công.'
    showToast(msg)
  }, [showToast, t])

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

