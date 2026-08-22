import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { createServer } from 'http'
import { env } from './config/env'
import { logger } from './shared/logger'
import { initSocket } from './modules/deploy/stream'
import { AppError } from './shared/errors'

import authRoutes from './modules/auth/routes'
import siteRoutes from './modules/sites/routes'
import deployRoutes from './modules/deploy/routes'
import credentialRoutes from './modules/credentials/routes'
import uploadRoutes from './modules/upload/routes'
import scheduleRoutes from './modules/schedules/routes'
import templateRoutes from './modules/templates/routes'
import webhookRoutes from './modules/webhooks/routes'
import notificationRoutes from './modules/notifications/routes'
import analyticsRoutes from './modules/analytics/routes'

const app = express()
const server = createServer(app)

initSocket(server)

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] }))
app.use(compression())
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/sites', siteRoutes)
app.use('/api/deploy', deployRoutes)
app.use('/api/credentials', credentialRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/schedules', scheduleRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/webhooks', webhookRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/analytics', analyticsRoutes)

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
  } else {
    logger.error({ err }, 'Unhandled error')
    res.status(500).json({ error: 'Internal server error' })
  }
})

server.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`)
})

export default app
