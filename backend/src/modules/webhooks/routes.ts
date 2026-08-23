import { Router } from 'express'
import { z } from 'zod'
import crypto from 'crypto'
import { requireAuth } from '../auth/middleware'
import { supabaseAdmin } from '../../config/database'
import { AuthRequest } from '../../shared/types'

const router = Router()
const TABLE = 'webhooks'

const webhookSchema = z.object({
  siteId: z.string().uuid(),
  githubRepo: z.string().min(1),
  branch: z.string().default('main'),
  secret: z.string().min(8),
  isActive: z.boolean().default(true),
})

/**
 * Verifies GitHub webhook HMAC signature
 * GitHub sends X-Hub-Signature-256: sha256=<hash>
 */
function verifyGitHubSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !signature.startsWith('sha256=')) {
    return false
  }
  
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*, sites(name, url)')
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch webhooks' })
  }
})

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = webhookSchema.parse(req.body)
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert({
        site_id: parsed.siteId,
        user_id: req.userId!,
        github_repo: parsed.githubRepo,
        branch: parsed.branch,
        secret: parsed.secret,
        is_active: parsed.isActive,
      })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create webhook' })
  }
})

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin
      .from(TABLE)
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete webhook' })
  }
})

router.post('/github-event', async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string
    const event = req.headers['x-github-event'] as string
    const payload = JSON.stringify(req.body)

    if (!event || event !== 'push') {
      return res.json({ received: true })
    }

    // Find matching webhooks first to get their secrets
    const repo = req.body.repository?.full_name
    const branch = req.body.ref?.replace('refs/heads/', '')

    if (!repo || !branch) {
      return res.json({ received: true })
    }

    const { data: webhooks } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('github_repo', repo)
      .eq('branch', branch)
      .eq('is_active', true)

    if (!webhooks || webhooks.length === 0) {
      return res.json({ received: true })
    }

    // Verify signature against at least one webhook secret
    let signatureValid = false
    for (const webhook of webhooks) {
      if (verifyGitHubSignature(payload, signature, webhook.secret)) {
        signatureValid = true
        break
      }
    }

    if (!signatureValid) {
      return res.status(401).json({ error: 'Invalid signature' })
    }

    // Signature verified - process the webhook
    for (const webhook of webhooks) {
      await supabaseAdmin.from('deployments').insert({
        site_id: webhook.site_id,
        user_id: webhook.user_id,
        provider: 'github',
        status: 'pending',
      })
    }

    res.json({ received: true })
  } catch (error) {
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

export default router
