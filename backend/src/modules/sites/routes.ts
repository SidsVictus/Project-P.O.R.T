import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../auth/middleware'
import { supabaseAdmin } from '../../config/database'
import { AuthRequest } from '../../shared/types'

const router = Router()
const TABLE = 'sites'

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
    res.status(500).json({ error: 'Failed to fetch sites' })
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
    res.status(404).json({ error: 'Site not found' })
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
    res.status(500).json({ error: 'Failed to delete site' })
  }
})

export default router
