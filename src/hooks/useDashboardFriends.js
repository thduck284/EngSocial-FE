import { useState, useEffect, useMemo, useRef } from 'react'
import { friendsService } from '../services'

/**
 * Friends list (all), filter tab (all/online), friend suggestions dropdown data,
 * and derived displayed list (filtered + sorted by online then lastActive).
 * @param {Set<string>} onlineUserIds - Set of online user ids (from socket)
 */
export function useDashboardFriends(onlineUserIds) {
  const [onlineFriends, setOnlineFriends] = useState([])
  const [friendsFilterTab, setFriendsFilterTab] = useState('all')
  const [friendTab, setFriendTab] = useState('suggestions')
  const [suggestionsList, setSuggestionsList] = useState([])
  const [sentRequestsList, setSentRequestsList] = useState([])
  const [receivedRequestsList, setReceivedRequestsList] = useState([])
  const [friendTabLoading, setFriendTabLoading] = useState(false)
  const [friendSelectOpen, setFriendSelectOpen] = useState(false)
  const friendSelectRef = useRef(null)

  useEffect(() => {
    friendsService.getList({ limit: 100 })
      .then((res) => {
        const list = res?.data?.data ?? res?.data ?? []
        setOnlineFriends(Array.isArray(list) ? list : [])
      })
      .catch(() => setOnlineFriends([]))
  }, [])

  const loadFriendTabData = (tab) => {
    setFriendTabLoading(true)
    if (tab === 'suggestions') {
      friendsService.getSuggestions({ limit: 10 })
        .then((res) => {
          const raw = res?.data?.data ?? res?.data ?? []
          const list = Array.isArray(raw) ? raw : []
          setSuggestionsList(list.map((item) => (item?.user ? { ...item.user, mutualFriendsCount: item.mutualFriendsCount ?? item.mutualCount } : item)))
        })
        .catch(() => setSuggestionsList([]))
        .finally(() => setFriendTabLoading(false))
    } else if (tab === 'sent') {
      friendsService.getSentRequests({ limit: 10 })
        .then((res) => {
          const list = res?.data?.data ?? res?.data ?? []
          setSentRequestsList(Array.isArray(list) ? list : [])
        })
        .catch(() => setSentRequestsList([]))
        .finally(() => setFriendTabLoading(false))
    } else {
      friendsService.getPendingRequests({ limit: 10 })
        .then((res) => {
          const list = res?.data?.data ?? res?.data ?? []
          setReceivedRequestsList(Array.isArray(list) ? list : [])
        })
        .catch(() => setReceivedRequestsList([]))
        .finally(() => setFriendTabLoading(false))
    }
  }

  useEffect(() => {
    loadFriendTabData(friendTab)
  }, [friendTab])

  useEffect(() => {
    if (!friendSelectOpen) return
    const handleClickOutside = (e) => {
      if (friendSelectRef.current && !friendSelectRef.current.contains(e.target)) setFriendSelectOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [friendSelectOpen])

  const displayedFriendsList = useMemo(() => {
    const list = friendsFilterTab === 'all'
      ? [...onlineFriends]
      : onlineFriends.filter((item) => {
          const u = item?.user || item
          const id = u?.id ?? u?._id
          return id != null && onlineUserIds.has(String(id))
        })
    if (friendsFilterTab !== 'all') return list
    const getActiveTime = (item) => {
      const u = item?.user || item
      const t = u?.lastActiveAt ?? u?.lastSeen ?? u?.lastActiveDate ?? item?.lastActiveAt ?? item?.updatedAt ?? item?.createdAt ?? 0
      return t ? new Date(t).getTime() : 0
    }
    return list.sort((a, b) => {
      const uA = a?.user || a
      const uB = b?.user || b
      const idA = uA?.id ?? uA?._id
      const idB = uB?.id ?? uB?._id
      const onlineA = idA != null && onlineUserIds.has(String(idA))
      const onlineB = idB != null && onlineUserIds.has(String(idB))
      if (onlineA && !onlineB) return -1
      if (!onlineA && onlineB) return 1
      return getActiveTime(b) - getActiveTime(a)
    })
  }, [friendsFilterTab, onlineFriends, onlineUserIds])

  return {
    onlineFriends,
    friendsFilterTab,
    setFriendsFilterTab,
    friendTab,
    setFriendTab,
    suggestionsList,
    sentRequestsList,
    receivedRequestsList,
    friendTabLoading,
    loadFriendTabData,
    displayedFriendsList,
    friendSelectOpen,
    setFriendSelectOpen,
    friendSelectRef,
  }
}
