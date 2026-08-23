import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
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

app.set('trust proxy', 1)

initSocket(server)

// Security middleware
// Rate limiting - prevent brute force and DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Helmet with CSP enabled
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval needed for some dev tools
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:', 'wss:'],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for compatibility
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: 'deny' },
}))

// CORS - allow both 5173 and 5174 for local dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}))

// Request logging
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

app.use(compression())
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authLimiter, authRoutes)
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
