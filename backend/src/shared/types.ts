import { Request } from 'express'

export interface AuthRequest extends Request {
  userId?: string
  userEmail?: string
  body: any
  params: any
  headers: any
}

export type Provider = 'surge' | 'netlify' | 'vercel' | 'cloudflare' | 'firebase' | 'github' | 'custom'

export type DeployStatus = 'pending' | 'uploading' | 'building' | 'deploying' | 'success' | 'failed'

export interface DeployJobData {
  deploymentId: string
  userId: string
  siteId: string
  provider: Provider
  siteName: string
  files: string
  hostingUrl?: string
  hostingEmail?: string
}

export interface ProviderDeployResult {
  success: boolean
  url?: string
  logs: string
  error?: string
}
