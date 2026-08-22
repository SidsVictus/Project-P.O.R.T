export type Provider = 'surge' | 'netlify' | 'vercel' | 'cloudflare' | 'firebase' | 'github' | 'custom'

export type DeployStatus = 'pending' | 'uploading' | 'building' | 'deploying' | 'success' | 'failed'

export interface Site {
  id: string
  user_id: string
  name: string
  url: string | null
  provider: Provider
  status: 'active' | 'failed' | 'archived'
  template_id: string | null
  created_at: string
  updated_at: string
}

export interface Deployment {
  id: string
  site_id: string
  user_id: string
  status: DeployStatus
  provider: Provider
  deploy_url: string | null
  logs: string
  scheduled_at: string | null
  completed_at: string | null
  created_at: string
}

export interface Credential {
  id: string
  user_id: string
  provider: Provider
  email: string | null
  created_at: string
}

export interface Schedule {
  id: string
  site_id: string
  user_id: string
  cron_expression: string | null
  next_run: string | null
  is_active: boolean
  created_at: string
}

export interface Template {
  id: string
  user_id: string
  name: string
  provider: Provider
  config: Record<string, unknown>
  created_at: string
}

export interface Webhook {
  id: string
  user_id: string
  site_id: string
  github_repo: string
  branch: string
  secret: string
  is_active: boolean
  last_triggered_at: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'email' | 'slack'
  destination: string
  is_active: boolean
  created_at: string
}

export interface AnalyticsEntry {
  id: string
  site_id: string
  user_id: string
  visits: number
  unique_visitors: number
  recorded_at: string
}

export interface DeployConfig {
  provider: Provider
  siteName: string
  hostingUrl?: string
  hostingEmail?: string
  scheduledAt?: string
  templateId?: string
  webhookRepo?: string
  branch?: string
}

export interface ProviderInfo {
  id: Provider
  name: string
  icon: string
  color: string
  freeTier: string
  url: string
}
