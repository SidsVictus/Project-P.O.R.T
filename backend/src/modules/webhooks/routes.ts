import { Router } from 'express'
import { z } from 'zod'
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
    const event = req.headers['x-github-event']
    const payload = req.body

    if (event === 'push' && payload.ref) {
      const branch = payload.ref.replace('refs/heads/', '')
      const repo = payload.repository.full_name

      const { data: webhooks } = await supabaseAdmin
        .from(TABLE)
        .select('*')
        .eq('github_repo', repo)
        .eq('branch', branch)
        .eq('is_active', true)

      for (const webhook of webhooks || []) {
        await supabaseAdmin.from('deployments').insert({
          site_id: webhook.site_id,
          user_id: webhook.user_id,
          provider: 'github',
          status: 'pending',
        })
      }
    }

    res.json({ received: true })
  } catch (error) {
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

export default router
