import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
let socket: Socket | null = null

export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] })
  }
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
