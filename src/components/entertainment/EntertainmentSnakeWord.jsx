import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { Link } from 'react-router-dom'
import { SOCKET_BASE_URL, ROUTES } from '../../constants'
import { getAuthToken } from '../../utils/auth'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'

const GRID_SIZE = 20

export const SNAKE_COLORS = [
  { id: 'cyan', head: '#22d3ee', body: '#0891b2', name: 'Cyber Cyan' },
  { id: 'emerald', head: '#34d399', body: '#059669', name: 'Toxic Emerald' },
  { id: 'fuchsia', head: '#e879f9', body: '#c026d3', name: 'Neon Fuchsia' },
  { id: 'amber', head: '#fbbf24', body: '#d97706', name: 'Solar Amber' },
  { id: 'rose', head: '#fb7185', body: '#e11d48', name: 'Blood Rose' },
  { id: 'indigo', head: '#818cf8', body: '#4f46e5', name: 'Deep Indigo' },
]

export function EntertainmentSnakeWord({ onExit }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [socket, setSocket] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [isDead, setIsDead] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [mapSize, setMapSize] = useState({ width: 1200, height: 800 })
  const [viewSize, setViewSize] = useState({ width: 800, height: 600 })

  const myUserId = String(user?.id || user?._id || '')

  // Resize handler using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setViewSize({ width, height })
      }
    })
    
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Initialize socket
  useEffect(() => {
    const token = getAuthToken()
    const newSocket = io(SOCKET_BASE_URL, {
      auth: { token },
      transports: ['websocket']
    })

    newSocket.on('connect', () => {
      const skinId = localStorage.getItem('snake_color') || 'cyan'
      newSocket.emit('snakeGameGame:joinWorld', { skinId }, (ack) => {
        if (ack?.ok) {
          setGameState(prev => ({ ...prev, ...ack.state }))
          if (ack.state.mapSize) setMapSize(ack.state.mapSize)
        }
      })
    })

    if (newSocket.connected) {
      const skinId = localStorage.getItem('snake_color') || 'cyan'
      newSocket.emit('snakeGameGame:joinWorld', { skinId }, (ack) => {
        if (ack?.ok) setGameState(prev => ({ ...prev, ...ack.state }))
      })
    }

    newSocket.on('snakeGameGame:tick', (data) => {
      setGameState(prev => ({ ...prev, ...data }))
      if (data.mapSize) setMapSize(data.mapSize)
    })

    newSocket.on('snakeGameGame:died', (data) => {
      if (String(data.userId) === myUserId) {
        setIsDead(true)
        setFinalScore(data.score)
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [myUserId])

  const handleRespawn = () => {
    setIsDead(false)
    const skinId = localStorage.getItem('snake_color') || 'cyan'
    socket.emit('snakeGameGame:joinWorld', { skinId }, (ack) => {
      if (ack.ok) setGameState(ack.state)
    })
  }

  // Handle Steering (360 degrees)
  useEffect(() => {
    if (!socket || isDead) return

    const handlePointerMove = (e) => {
      const x = e.clientX || (e.touches && e.touches[0].clientX)
      const y = e.clientY || (e.touches && e.touches[0].clientY)
      if (x === undefined || y === undefined) return

      const centerX = viewSize.width / 2
      const centerY = viewSize.height / 2
      
      const angle = Math.atan2(y - centerY, x - centerX)
      socket.emit('snakeGameGame:move', { angle })
    }

    const handlePointerDown = () => socket.emit('snakeGameGame:move', { boost: true })
    const handlePointerUp = () => socket.emit('snakeGameGame:move', { boost: false })

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('mouseup', handlePointerUp)
    window.addEventListener('touchstart', handlePointerDown)
    window.addEventListener('touchend', handlePointerUp)
    window.addEventListener('touchmove', handlePointerMove)

    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchstart', handlePointerDown)
      window.removeEventListener('touchend', handlePointerUp)
      window.removeEventListener('touchmove', handlePointerMove)
    }
  }, [socket, isDead, viewSize])

  // Handle keyboard boosting (Space)
  useEffect(() => {
    if (!socket || isDead) return
    const down = (e) => { if (e.code === 'Space') socket.emit('snakeGameGame:move', { boost: true }) }
    const up = (e) => { if (e.code === 'Space') socket.emit('snakeGameGame:move', { boost: false }) }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [socket, isDead])

  // Canvas Rendering with Camera
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !gameState) return

    const ctx = canvas.getContext('2d')
    let animationFrameId

    const render = () => {
      try {
        // Find my player for camera
        const me = gameState.players?.find(p => String(p.userId) === myUserId)
        const head = me?.snake?.[0] || { x: mapSize.width / 2, y: mapSize.height / 2 }

        const safeHeadX = isNaN(head.x) ? mapSize.width / 2 : head.x
        const safeHeadY = isNaN(head.y) ? mapSize.height / 2 : head.y

        // Calculate camera offset to center player
        const camX = viewSize.width / 2 - safeHeadX
        const camY = viewSize.height / 2 - safeHeadY

        // Clear background
        ctx.fillStyle = '#020617' // Slate 950
        ctx.fillRect(0, 0, viewSize.width, viewSize.height)

        ctx.save()
        ctx.translate(camX, camY)

        // Draw world bounds
        ctx.strokeStyle = '#1e293b'
        ctx.lineWidth = 4
        ctx.strokeRect(0, 0, mapSize?.width || 20000, mapSize?.height || 20000)

        // Draw food (Culled)
        if (gameState.food && Array.isArray(gameState.food)) {
          gameState.food.forEach(f => {
            if (!f) return
            // Check if food is in viewport
            if (f.x < -camX - 100 || f.x > -camX + viewSize.width + 100 ||
                f.y < -camY - 100 || f.y > -camY + viewSize.height + 100) return

            // Multi-color palette for distractors
            const colors = [
              { main: '#f43f5e', light: 'rgba(244, 63, 94, 0.1)' }, // Rose
              { main: '#f59e0b', light: 'rgba(245, 158, 11, 0.1)' }, // Amber
              { main: '#10b981', light: 'rgba(16, 185, 129, 0.1)' }, // Emerald
              { main: '#8b5cf6', light: 'rgba(139, 92, 246, 0.1)' }, // Violet
              { main: '#f97316', light: 'rgba(249, 115, 22, 0.1)' }, // Orange
              { main: '#d946ef', light: 'rgba(217, 70, 239, 0.1)' }, // Fuchsia
            ]
            
            // Deterministic color based on ID
            const safeId = f.id || ''
            const colorIdx = Math.abs(safeId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length
            const distColor = colors[colorIdx] || colors[0]

            ctx.font = 'bold 13px Inter, sans-serif'
            const safeText = f.text || ''
            const textWidth = ctx.measureText(safeText).width
            const padding = 10
            const rectW = textWidth + padding * 2
            const rectH = 28
            
            const rx = f.x - rectW / 2 + GRID_SIZE / 2
            const ry = f.y - rectH / 2 + GRID_SIZE / 2
            
            const isMyTarget = safeText === me?.targetWord?.word
            
            // Outer glow and styling
            if (isMyTarget) {
                ctx.shadowBlur = 15
                ctx.shadowColor = '#22d3ee'
                ctx.fillStyle = 'rgba(34, 211, 238, 0.2)'
                ctx.strokeStyle = '#22d3ee'
            } else if (f.isDroppedPoints) {
                ctx.shadowBlur = 20
                ctx.shadowColor = '#fbbf24' // Gold
                ctx.fillStyle = 'rgba(251, 191, 36, 0.3)'
                ctx.strokeStyle = '#fbbf24'
            } else {
                ctx.shadowBlur = 5
                ctx.shadowColor = distColor.main
                ctx.fillStyle = distColor.light
                ctx.strokeStyle = distColor.main
            }

            ctx.lineWidth = 2
            
            ctx.beginPath()
            if (f.isDroppedPoints) {
                // Draw circle for dropped points
                ctx.arc(f.x + GRID_SIZE / 2, f.y + GRID_SIZE / 2, GRID_SIZE / 2 + 2, 0, Math.PI * 2)
            } else {
                if (ctx.roundRect) ctx.roundRect(rx, ry, rectW, rectH, 8)
                else ctx.rect(rx, ry, rectW, rectH)
            }
            ctx.fill()
            ctx.stroke()
            ctx.shadowBlur = 0

            ctx.fillStyle = 'white'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(safeText, f.x + GRID_SIZE / 2, f.y + GRID_SIZE / 2)
          })
        }

        // Draw Directional Indicator for Target Food
        if (me?.targetWord?.word && gameState.food && Array.isArray(gameState.food)) {
            const targetFood = gameState.food.find(f => f.text === me.targetWord.word && !f.isDroppedPoints)
            if (targetFood) {
                const dx = (targetFood.x + GRID_SIZE / 2) - safeHeadX
                const dy = (targetFood.y + GRID_SIZE / 2) - safeHeadY
                const dist = Math.sqrt(dx * dx + dy * dy)
                
                // If distance is large enough (> 1500), draw arrow around head
                if (dist > 1500) {
                    const angle = Math.atan2(dy, dx)
                    const orbitRadius = 80 // pixels from head
                    
                    const arrowX = safeHeadX + Math.cos(angle) * orbitRadius
                    const arrowY = safeHeadY + Math.sin(angle) * orbitRadius
                    
                    ctx.save()
                    ctx.translate(arrowX, arrowY)
                    ctx.rotate(angle)
                    
                    // Draw arrow shape
                    ctx.beginPath()
                    ctx.moveTo(12, 0)
                    ctx.lineTo(-6, 10)
                    ctx.lineTo(-2, 0)
                    ctx.lineTo(-6, -10)
                    ctx.closePath()
                    
                    ctx.fillStyle = 'rgba(34, 211, 238, 0.9)' // Cyan
                    ctx.shadowBlur = 15
                    ctx.shadowColor = '#22d3ee'
                    ctx.fill()
                    
                    // Draw distance text
                    ctx.rotate(-angle) // reset rotation so text is upright
                    ctx.fillStyle = '#22d3ee'
                    ctx.font = 'bold 11px Inter, sans-serif'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText(`${Math.floor(dist)}m`, 0, 22)
                    
                    ctx.restore()
                }
            }
        }

        // Draw snakes (Culled)
        if (gameState.players && Array.isArray(gameState.players)) {
          gameState.players.forEach(p => {
            const isMe = String(p.userId) === myUserId
            
            if (!p.snake || !Array.isArray(p.snake)) return

            // Optimization: Check if any part of the snake is visible
            const isSnakeVisible = p.snake.some(seg => 
              seg && seg.x >= -camX - 50 && seg.x <= -camX + viewSize.width + 50 &&
              seg.y >= -camY - 50 && seg.y <= -camY + viewSize.height + 50
            )
            if (!isSnakeVisible) return

            const skinId = p.skinId || (isMe ? (localStorage.getItem('snake_color') || 'cyan') : 'cyan')
            const skin = SNAKE_COLORS.find(c => c.id === skinId) || SNAKE_COLORS[0]

            p.snake.forEach((seg, idx) => {
              if (!seg) return
              // Cull individual segments
              if (seg.x < -camX - 30 || seg.x > -camX + viewSize.width + 30 ||
                  seg.y < -camY - 30 || seg.y > -camY + viewSize.height + 30) return

              const isHead = idx === 0
              const radius = isHead ? 14 : 10
              
              ctx.fillStyle = isHead ? skin.head : skin.body
              if (isHead) {
                ctx.shadowBlur = 20
                ctx.shadowColor = skin.head
              } else {
                ctx.shadowBlur = 0
              }

              ctx.beginPath()
              ctx.arc(seg.x, seg.y, radius, 0, Math.PI * 2)
              ctx.fill()
              ctx.shadowBlur = 0

              // Draw eyes on the head
              if (isHead) {
                const eyeAngle = p.angle || 0
                ctx.fillStyle = 'white'
                // Left
                ctx.beginPath()
                ctx.arc(seg.x + Math.cos(eyeAngle - 0.5) * 8, seg.y + Math.sin(eyeAngle - 0.5) * 8, 4, 0, Math.PI * 2)
                ctx.fill()
                // Right
                ctx.beginPath()
                ctx.arc(seg.x + Math.cos(eyeAngle + 0.5) * 8, seg.y + Math.sin(eyeAngle + 0.5) * 8, 4, 0, Math.PI * 2)
                ctx.fill()
                
                // Pupils
                ctx.fillStyle = 'black'
                ctx.beginPath()
                ctx.arc(seg.x + Math.cos(eyeAngle - 0.5) * 10, seg.y + Math.sin(eyeAngle - 0.5) * 10, 2, 0, Math.PI * 2)
                ctx.fill()
                ctx.beginPath()
                ctx.arc(seg.x + Math.cos(eyeAngle + 0.5) * 10, seg.y + Math.sin(eyeAngle + 0.5) * 10, 2, 0, Math.PI * 2)
                ctx.fill()
              }
            })
            ctx.shadowBlur = 0

            // Draw name for visible snakes
            const head = p.snake[0]
            if (head && head.x >= -camX && head.x <= -camX + viewSize.width &&
                head.y >= -camY && head.y <= -camY + viewSize.height) {
              ctx.fillStyle = isMe ? '#fff' : 'rgba(255, 255, 255, 0.7)'
              ctx.font = isMe ? 'bold 12px Inter' : '10px Inter'
              ctx.textAlign = 'center'
              ctx.fillText(p.name || 'Player', head.x, head.y - 20)
            }
          })
        }

        ctx.restore()

        // Draw static UI (Mini-map overlay)
        const miniMapSize = 150
        const miniScaleX = miniMapSize / (mapSize?.width || 20000)
        const miniScaleY = miniMapSize / (mapSize?.height || 20000)
        const mx = viewSize.width - miniMapSize - 20
        const my = viewSize.height - miniMapSize - 20

        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)'
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 1
        ctx.beginPath()
        if (ctx.roundRect) ctx.roundRect(mx, my, miniMapSize, miniMapSize, 12)
        else ctx.rect(mx, my, miniMapSize, miniMapSize)
        ctx.fill()
        ctx.stroke()

        // Players on minimap
        if (gameState.players && Array.isArray(gameState.players)) {
          gameState.players.forEach(p => {
            const isMe = String(p.userId) === myUserId
            const pHead = p.snake?.[0]
            if (!pHead || isNaN(pHead.x) || isNaN(pHead.y)) return

            ctx.fillStyle = isMe ? '#22d3ee' : '#f59e0b'
            ctx.beginPath()
            ctx.arc(mx + pHead.x * miniScaleX, my + pHead.y * miniScaleY, isMe ? 3 : 2, 0, Math.PI * 2)
            ctx.fill()
          })
        }
      } catch (err) {
        ctx.restore() // Restore in case it crashed inside translate
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, viewSize.width, viewSize.height)
        ctx.fillStyle = 'red'
        ctx.font = '14px monospace'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(`Error in render loop: ${err.message}`, 20, 20)
        const stackLines = (err.stack || '').split('\n')
        stackLines.forEach((line, i) => {
          ctx.fillText(line, 20, 40 + i * 20)
        })
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [gameState, myUserId, mapSize, viewSize])


  const myPlayer = gameState?.players?.find(p => String(p.userId) === myUserId)

  return (
    <div className="relative flex-1 bg-slate-950 flex flex-col overflow-hidden select-none touch-none rounded-2xl border border-white/5" ref={containerRef}>
      {/* HUD Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-start justify-between pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl shadow-2xl">
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-black mb-1">Target Word</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-none">
              {myPlayer?.targetWord?.meaning || '...'}
            </h3>
          </div>
          <div className="flex gap-2">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-4 py-2 rounded-xl flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-sm">stars</span>
                <span className="text-xl font-black text-white leading-none">{myPlayer?.score || 0}</span>
              </div>
              {myPlayer?.wrongCount > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  <span className="text-[10px] font-black uppercase tracking-wider">{myPlayer.wrongCount}</span>
                </div>
              )}
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-4 py-2 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-fuchsia-400 text-sm">groups</span>
              <span className="text-lg font-black text-white">{gameState?.players?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 pointer-events-auto">
            {/* Leaderboard */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 rounded-2xl w-48 hidden sm:block shadow-2xl">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 border-b border-white/5 pb-2">Leaderboard</p>
                <div className="space-y-2">
                    {[...(gameState?.players || [])].sort((a, b) => b.score - a.score).slice(0, 5).map((p, i) => (
                        <div key={p.userId} className="flex items-center gap-3 justify-between">
                            <span className={`text-[11px] font-bold truncate ${String(p.userId) === myUserId ? 'text-cyan-400' : 'text-slate-300'}`}>
                                {i + 1}. {p.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">{p.score}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={viewSize.width}
        height={viewSize.height}
        className="w-full h-full cursor-crosshair"
      />

      {isDead && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full" />
            <div className="relative size-24 bg-rose-500/20 rounded-3xl flex items-center justify-center border border-rose-500/50 rotate-12">
              <span className="material-symbols-outlined text-rose-500 text-6xl -rotate-12">skull</span>
            </div>
          </div>
          <h2 className="text-6xl sm:text-8xl font-black text-white mb-2 tracking-tighter">WASTED</h2>
          <div className="mb-12 space-y-1">
            <p className="text-slate-500 uppercase text-xs font-black tracking-[0.3em]">Game Over Stats</p>
            <p className="text-5xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">{finalScore}</p>
          </div>
          <button 
            onClick={handleRespawn}
            className="group relative px-12 py-5 bg-white text-slate-950 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95"
          >
            PLAY AGAIN
          </button>
        </div>
      )}


      {/* Exit Button */}
      <button 
        onClick={onExit}
        className="absolute bottom-6 left-6 z-20 size-12 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-rose-500 transition-all hover:scale-110 active:scale-90"
      >
        <span className="material-symbols-outlined">logout</span>
      </button>
    </div>
  )
}
