import { Server as SocketIOServer, Socket } from 'socket.io'
import { Server } from 'http'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env'

let io: SocketIOServer

export function initSocket(server: Server) {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Authentication required'))
    try {
      const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET) as { sub: string }
      socket.data.userId = decoded.sub
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId
    socket.join(`user:${userId}`)
  })

  return io
}

export function getIO() {
  return io
}

export function emitDeployLog(userId: string, deploymentId: string, message: string) {
  io?.to(`user:${userId}`).emit('deploy:log', { deploymentId, message })
}

export function emitDeployStatus(userId: string, deploymentId: string, status: string) {
  io?.to(`user:${userId}`).emit('deploy:status', { deploymentId, status })
}
