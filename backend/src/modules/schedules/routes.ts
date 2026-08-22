import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../auth/middleware'
import { supabaseAdmin } from '../../config/database'
import { AuthRequest } from '../../shared/types'

const router = Router()
const TABLE = 'schedules'

const scheduleSchema = z.object({
  siteId: z.string().uuid(),
  cronExpression: z.string().optional(),
  nextRun: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
})

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*, sites(name, url, provider)')
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedules' })
  }
})

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = scheduleSchema.parse(req.body)
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert({
        site_id: parsed.siteId,
        user_id: req.userId!,
        cron_expression: parsed.cronExpression || null,
        next_run: parsed.nextRun || null,
        is_active: parsed.isActive,
      })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create schedule' })
  }
})

router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update(req.body)
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: 'Failed to update schedule' })
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
    res.status(500).json({ error: 'Failed to delete schedule' })
  }
})

export default router
