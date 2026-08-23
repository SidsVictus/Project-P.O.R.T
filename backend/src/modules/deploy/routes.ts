import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../auth/middleware'
import { supabaseAdmin } from '../../config/database'
import { emitDeployLog, emitDeployStatus } from './stream'
import { addDeployJob } from './queue'
import { executeDeploy } from './engine'
import { AuthRequest } from '../../shared/types'

const router = Router()
const TABLE = 'deployments'
const SITES_TABLE = 'sites'

const deploySchema = z.object({
  provider: z.enum(['surge', 'netlify', 'vercel', 'cloudflare', 'firebase', 'github', 'custom']),
  siteName: z.string().min(1),
  uploadDir: z.string().min(1),
  hostingUrl: z.string().optional(),
  hostingEmail: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
})

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deployments' })
  }
})

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
      .single()
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(404).json({ error: 'Deployment not found' })
  }
})

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = deploySchema.parse(req.body)

    const { data: site, error: siteError } = await supabaseAdmin
      .from(SITES_TABLE)
      .insert({
        user_id: req.userId!,
        name: parsed.siteName,
        provider: parsed.provider,
        status: 'active',
      })
      .select()
      .single()
    if (siteError) throw siteError

    const { data: deployment, error: deployError } = await supabaseAdmin
      .from(TABLE)
      .insert({
        site_id: site.id,
        user_id: req.userId!,
        provider: parsed.provider,
        status: parsed.scheduledAt ? 'pending' : 'pending',
        scheduled_at: parsed.scheduledAt || null,
      })
      .select()
      .single()
    if (deployError) throw deployError

    if (parsed.scheduledAt) {
      const delay = new Date(parsed.scheduledAt).getTime() - Date.now()
      if (delay > 0) {
        await addDeployJob({
          deploymentId: deployment.id,
          userId: req.userId!,
          siteId: site.id,
          provider: parsed.provider,
          siteName: parsed.siteName,
          uploadDir: parsed.uploadDir,
          hostingEmail: parsed.hostingEmail,
          delay,
        })
      }
    } else {
      emitDeployStatus(req.userId!, deployment.id, 'building')
      executeDeploy(
        deployment.id,
        req.userId!,
        site.id,
        parsed.provider,
        parsed.siteName,
        parsed.uploadDir,
        parsed.hostingEmail,
        (msg) => emitDeployLog(req.userId!, deployment.id, msg)
      )
    }

    res.json({ site, deployment })
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Deploy failed' })
  }
})

export default router
