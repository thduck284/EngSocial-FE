import { ROUTES } from '../constants'

export function isPostNotification(n) {
  return (
    n.type === 'mention' ||
    n.type === 'post_mention' ||
    n.type === 'post_shared' ||
    n.type === 'comment' ||
    n.type === 'like' ||
    n.type === 'post_like' ||
    n.type === 'comment_like' ||
    n.relatedType === 'post'
  )
}

export function getPostIdFromNotification(n) {
  return n?.data?.postId || n?.relatedId || null
}

export function getNotificationLink(n) {
  if ((n.type === 'friend_request' || n.type === 'friend_request_accepted') && n.fromUserId) {
    return ROUTES.PROFILE_USER(n.fromUserId)
  }
  if (n.type === 'mention' || n.type === 'post_mention' || n.type === 'post_shared') {
    const pid = getPostIdFromNotification(n)
    if (pid) return `${ROUTES.COMMUNITY}/posts/${pid}`
  }
  if (n.type === 'group_invite') {
    const gid = n.data?.groupId || n.relatedId
    if (gid) return `/community/group/${gid}/about`
  }
  if (n.type === 'challenge') return ROUTES.CHALLENGE
  if (n.relatedType === 'post' && n.relatedId) return `${ROUTES.COMMUNITY}/posts/${n.relatedId}`
  return null
}

export function renderNotificationContent(n, t) {
  if (n.type === 'friend_request') {
    const fromName = n.data?.fromUserName || n.message?.split(' ')[0] || 'Someone'
    return (
      <>
        <span className="font-bold">{fromName}</span>
        {t('notifications.friendRequestSuffix', { defaultValue: ' sent you a friend request.' })}
      </>
    )
  }
  if (n.type === 'friend_request_accepted') {
    const accepterName = n.data?.accepterName || n.message?.split(' ')[0] || 'Someone'
    return (
      <>
        <span className="font-bold">{accepterName}</span>
        {t('notifications.friendRequestAcceptedSuffix', { defaultValue: ' accepted your friend request.' })}
      </>
    )
  }
  if (n.type === 'comment') {
    return (
      <>
        <span className="font-bold">{n.data?.userName || 'Someone'}</span>{' '}
        {t('notifications.commentedPost', { defaultValue: 'commented on your post.' })}
      </>
    )
  }
  if (n.type === 'challenge') {
    return (
      <>
        <span className="font-bold">{n.title}</span> {n.message}
      </>
    )
  }
  if (n.type === 'like' || n.type === 'post_like') {
    return (
      <>
        <span className="font-bold">{n.data?.userName || 'Someone'}</span>{' '}
        {t('notifications.likedPost', { defaultValue: 'liked your post.' })}
      </>
    )
  }
  if (n.type === 'comment_like') {
    return (
      <>
        <span className="font-bold">{n.data?.userName || 'Someone'}</span>{' '}
        {t('notifications.likedComment', { defaultValue: 'reacted to your comment.' })}
      </>
    )
  }
  if (n.type === 'mention' || n.type === 'post_mention') {
    return (
      <>
        <span className="font-bold">{n.data?.userName || 'Someone'}</span>{' '}
        {t('notifications.mentionedYou', { defaultValue: 'mentioned you in a post.' })}
      </>
    )
  }
  if (n.type === 'post_shared') {
    return (
      <>
        <span className="font-bold">{n.data?.userName || 'Someone'}</span>{' '}
        {t('notifications.postShared', { defaultValue: 'shared your post.' })}
      </>
    )
  }
  if (n.type === 'group_invite') {
    return n.message || n.title || t('notifications.groupInviteFallback', { defaultValue: 'You were invited to a group.' })
  }
  if (n.type === 'system') {
    if (n.data?.kind === 'report_status_change' && n.title && n.message) {
      return (
        <>
          <span className="font-bold">{n.title}</span> {n.message}
        </>
      )
    }
    return n.message || n.title || t('notifications.systemFallback', { defaultValue: 'System notification.' })
  }
  return n.message || n.title || null
}
