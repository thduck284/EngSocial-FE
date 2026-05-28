import { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { io } from 'socket.io-client'
import { useDashboardFriends } from '../../hooks'
import { DEFAULT_AVATAR } from '../../constants/ui'
import { useAuth } from '../../context/AuthContext'
import { getAuthToken } from '../../utils/auth'
import { SOCKET_BASE_URL } from '../../constants/api'

export function WordScrambleFriendInviteModal({ open, onClose, inviteUrl, onInviteSent }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  
  // Presence Logic để theo dõi trạng thái online toàn hệ thống
  const [onlineUserIds, setOnlineUserIds] = useState(new Set())
  const socketRef = useRef(null)

  // Truyền onlineUserIds vào hook để nó tính toán isOnline toàn cục
  const { displayedFriendsList, friendTabLoading, setOnlineFriends } = useDashboardFriends(onlineUserIds, setOnlineUserIds)

  useEffect(() => {
    if (!open || !user) return
    const token = getAuthToken()
    if (!token) return

    // Kết nối socket presence giống như Dashboard
    const socket = io(SOCKET_BASE_URL, { auth: { token }, transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => {
      // Một số hệ thống sẽ gửi danh sách online ngay khi connect
      // Nếu server có emit('getOnlineFriends') thì gọi ở đây
    })

    socket.on('conversation:userOnline', (payload) => {
      const uid = payload?.userId ? String(payload.userId) : null
      if (uid) setOnlineUserIds(prev => new Set([...prev, uid]))
    })

    socket.on('conversation:userOffline', (payload) => {
      const uid = payload?.userId ? String(payload.userId) : null
      if (uid) setOnlineUserIds(prev => {
        const next = new Set(prev)
        next.delete(uid)
        return next
      })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [open, user])

  const filteredFriends = useMemo(() => {
    if (!searchTerm) return displayedFriendsList
    return displayedFriendsList.filter(f => {
      const u = f?.user || f
      return u?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [displayedFriendsList, searchTerm])

  if (!open) return null

  const [invitationCooldowns, setInvitationCooldowns] = useState({})

  useEffect(() => {
    const timer = setInterval(() => {
      setInvitationCooldowns(prev => {
        const next = { ...prev }
        let changed = false
        Object.keys(next).forEach(id => {
          if (next[id] > 0) {
            next[id] -= 1
            changed = true
          } else {
            delete next[id]
            changed = true
          }
        })
        return changed ? next : prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleInvite = (friend) => {
    const u = friend?.user || friend
    const uid = u.id || u._id
    if (invitationCooldowns[uid]) return

    if (onInviteSent) onInviteSent(friend)
    
    // Set 10s cooldown
    setInvitationCooldowns(prev => ({ ...prev, [uid]: 10 }))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-slate-900 border border-fuchsia-500/30 rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden ws-fade-rise">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-fuchsia-500/10 to-transparent">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight uppercase italic flex items-center gap-2">
              <span className="material-symbols-outlined text-fuchsia-400">group_add</span>
              {t('groups.inviteModal.title')}
            </h3>
            <p className="text-xs text-slate-400 font-medium">{t('groups.inviteModal.subtitle')}</p>
          </div>
          <button 
            onClick={onClose}
            className="size-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/5 bg-slate-950/20">
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-xl group-focus-within:text-fuchsia-400 transition-colors">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('groups.inviteModal.searchPlaceholder')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-fuchsia-500/50 transition-all"
            />
          </div>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {friendTabLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
              <span className="material-symbols-outlined animate-spin text-3xl text-fuchsia-400">progress_activity</span>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('common.loading')}</p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-30">
              <span className="material-symbols-outlined text-4xl">person_off</span>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('groups.inviteModal.noResults')}</p>
            </div>
          ) : (
            filteredFriends.map((friend) => {
              const u = friend?.user || friend
              const isOnline = friend.isOnline
              
              return (
                <div 
                  key={u.id || u._id}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
                >
                  <div className="relative shrink-0">
                    <img
                      src={u.avatar || DEFAULT_AVATAR}
                      alt={u.name}
                      className="size-12 rounded-xl object-cover ring-2 ring-white/5"
                    />
                    {isOnline && (
                      <span className="absolute -bottom-1 -right-1 size-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-lg" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-100 truncate">{u.name}</p>
                    <p className={`text-[10px] font-black uppercase tracking-wider ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {isOnline ? t('userProfile.online') : 'Offline'}
                    </p>
                  </div>

                  {isOnline && (
                    <button
                      onClick={() => handleInvite(friend)}
                      disabled={invitationCooldowns[u.id || u._id] > 0}
                      className={`px-4 py-1.5 rounded-lg text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-1.5 ${
                        invitationCooldowns[u.id || u._id] 
                          ? 'bg-amber-500 shadow-amber-500/20' 
                          : 'bg-fuchsia-600 shadow-fuchsia-500/20 hover:bg-fuchsia-500'
                      }`}
                    >
                      {invitationCooldowns[u.id || u._id] ? (
                        <>
                          <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                          {invitationCooldowns[u.id || u._id]}s
                        </>
                      ) : (
                        t('enter.game.wsLobbyInvite')
                      )}
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer (Copy link) */}
        <div className="p-4 bg-slate-950/40 border-t border-white/5">
           <p className="text-[10px] text-slate-500 text-center mb-3 font-medium">Link phòng</p>
           <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
             <input 
              readOnly 
              value={inviteUrl} 
              className="flex-1 bg-transparent border-none focus:ring-0 text-[10px] text-fuchsia-300 font-mono truncate"
             />
             <button 
              onClick={() => {
                navigator.clipboard.writeText(inviteUrl)
                // maybe show a toast?
              }}
              className="material-symbols-outlined text-slate-400 hover:text-fuchsia-400 transition-colors text-base"
             >
              content_copy
             </button>
           </div>
        </div>
      </div>
    </div>
  )
}
