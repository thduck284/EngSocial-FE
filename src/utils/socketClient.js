/** Socket.IO client helpers — polling first helps Render cold start / free tier. */
export function createSocketAuthOptions(token) {
  return {
    auth: { token },
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 8,
    timeout: 25000,
  }
}

/** Avoid console warning when React cleanup runs before the socket finishes connecting. */
export function disconnectSocketSafe(socket) {
  if (!socket) return
  socket.removeAllListeners()
  if (socket.connected) {
    socket.disconnect()
    return
  }
  socket.io.opts.reconnection = false
  if (typeof socket.close === 'function') socket.close()
}
