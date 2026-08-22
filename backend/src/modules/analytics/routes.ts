import { Router } from 'express'
import { requireAuth } from '../auth/middleware'
import { supabaseAdmin } from '../../config/database'
import { AuthRequest } from '../../shared/types'

const router = Router()
const TABLE = 'analytics'

router.get('/:siteId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('site_id', req.params.siteId)
      .eq('user_id', req.userId!)
      .order('recorded_at', { ascending: false })
      .limit(30)
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

router.get('/:siteId/summary', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('visits, unique_visitors, recorded_at')
      .eq('site_id', req.params.siteId)
      .eq('user_id', req.userId!)
      .order('recorded_at', { ascending: false })
      .limit(30)
    if (error) throw error

    const totalVisits = data?.reduce((sum, d) => sum + (d.visits || 0), 0) || 0
    const totalUnique = data?.reduce((sum, d) => sum + (d.unique_visitors || 0), 0) || 0

    res.json({ totalVisits, totalUnique, dailyData: data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics summary' })
  }
})

export default router
