import { Request } from 'express'

export interface AuthRequest extends Request<any, any, any, any> {
  userId?: string
  userEmail?: string
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
