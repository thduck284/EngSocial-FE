import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { friendsService } from '../../services/friends.service'
import { DEFAULT_AVATAR } from '../../constants/ui'

export function WordScrambleInviteBubble({ lobby, onClose }) {
  const { t } = useTranslation()
  const [friends, setFriends] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [invitedIds, setInvitedIds] = useState(new Set())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await friendsService.getList({ page: 1, limit: 100 })
        const list = res?.data?.data || res?.data?.friends || res?.data || []
        const normalized = Array.isArray(list) 
          ? list.map(f => {
              const u = f?.user || f
              return {
                id: u.id || u._id || f.id || f._id,
                name: u.name || f.name || '',
                avatar: u.avatar || f.avatar || '',
                online: u.isOnline || u.online || false, 
                lastActiveAt: u.lastActiveAt || u.updatedAt || f.updatedAt || 0
              }
            })
          : []
        
        // Sort: Online first, then by name
        const sorted = normalized.sort((a, b) => {
          if (a.online && !b.online) return -1
          if (!a.online && b.online) return 1
          return a.name.localeCompare(b.name)
        })

        if (!cancelled) setFriends(sorted.filter(f => f.id))
      } catch {
        if (!cancelled) setFriends([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const filtered = friends.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  const handleInvite = (friend) => {
    alert("Button clicked! Testing invite...")
    if (invitedIds.has(friend.id)) {
      alert("Already invited this friend.")
      return
    }
    
    setInvitedIds(prev => new Set([...prev, friend.id]))
    
    if (typeof lobby?.inviteFriend === 'function') {
      alert("Triggering lobby.inviteFriend()")
      lobby.inviteFriend(friend.id, lobby.inviteUrl)
    } else {
      alert("ERROR: lobby.inviteFriend is not a function")
    }
    
    if (lobby?.sendChat) {
      lobby.sendChat(`📢 Invited ${friend.name} to the game!`)
    }
  }

  return (
    <div 
      className="absolute top-10 right-0 z-[100] w-72 bg-slate-950 border border-fuchsia-500/30 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in fade-in zoom-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-3 border-b border-fuchsia-500/15">
        <h3 className="text-xs font-bold text-white uppercase tracking-widest">{t('enter.game.inviteFriendsTitle', { defaultValue: 'Invite Friends' })}</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">search</span>
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('groups.inviteModal.searchPlaceholder', { defaultValue: 'Search friends...' })}
            className="w-full bg-slate-900/50 border border-fuchsia-500/10 rounded-xl py-1.5 pl-7 pr-3 text-[10px] text-white placeholder:text-slate-600 focus:outline-none focus:border-fuchsia-500/30 transition-all"
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto px-1 pb-2 space-y-0.5 scrollbar-thin scrollbar-thumb-fuchsia-500/20">
        {loading ? (
          <div className="py-8 text-center text-slate-500 text-[10px] animate-pulse uppercase font-bold tracking-widest">
            {t('common.loading', { defaultValue: 'Loading...' })}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            {t('groups.inviteModal.noResults', { defaultValue: 'No friends found' })}
          </div>
        ) : (
          filtered.map(f => (
            <div key={f.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  <img src={f.avatar || DEFAULT_AVATAR} alt="" className="size-8 rounded-full object-cover border border-fuchsia-500/20" />
                  <div className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-slate-950 ${f.online ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                </div>
                <span className={`text-xs font-medium truncate group-hover:text-white transition-colors ${f.online ? 'text-slate-200' : 'text-slate-500'}`}>{f.name}</span>
              </div>
              <button
                onClick={() => handleInvite(f)}
                disabled={invitedIds.has(f.id)}
                className={`text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-lg transition-all ${
                  invitedIds.has(f.id)
                    ? 'bg-slate-800 text-slate-500 cursor-default'
                    : 'bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30 hover:bg-fuchsia-600 hover:text-white'
                }`}
              >
                {invitedIds.has(f.id) ? t('common.sent', { defaultValue: 'Sent' }) : t('common.invite', { defaultValue: 'Invite' })}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-2 border-t border-fuchsia-500/15">
        <button 
          onClick={() => {
            navigator.clipboard.writeText(lobby?.inviteUrl || window.location.href);
            onClose();
          }}
          className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 transition-all border border-transparent hover:border-slate-700/50"
        >
          {t('enter.game.wsLobbyCopyLink', { defaultValue: 'Copy invite link' })}
        </button>
      </div>
    </div>
  )
}
