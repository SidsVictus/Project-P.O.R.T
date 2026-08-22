import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../auth/middleware'
import { supabaseAdmin } from '../../config/database'
import { AuthRequest } from '../../shared/types'

const router = Router()
const TABLE = 'notifications'

const notifSchema = z.object({
  type: z.enum(['email', 'slack']),
  destination: z.string().min(1),
  isActive: z.boolean().default(true),
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
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = notifSchema.parse(req.body)
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert({ user_id: req.userId!, ...parsed })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create notification' })
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
    res.status(500).json({ error: 'Failed to delete notification' })
  }
})

export default router
