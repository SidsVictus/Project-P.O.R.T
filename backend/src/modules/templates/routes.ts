import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../auth/middleware'
import { supabaseAdmin } from '../../config/database'
import { AuthRequest } from '../../shared/types'

const router = Router()
const TABLE = 'templates'

const templateSchema = z.object({
  name: z.string().min(1),
  provider: z.enum(['surge', 'netlify', 'vercel', 'cloudflare', 'firebase', 'github', 'custom']),
  config: z.record(z.unknown()).default({}),
})

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' })
  }
})

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = templateSchema.parse(req.body)
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert({
        user_id: req.userId!,
        name: parsed.name,
        provider: parsed.provider,
        config: parsed.config,
      })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create template' })
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
    res.status(500).json({ error: 'Failed to delete template' })
  }
})

export default router
