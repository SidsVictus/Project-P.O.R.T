import { Router } from 'express'
import { requireAuth } from './middleware'
import { AuthRequest } from '../../shared/types'

const router = Router()

router.get('/me', requireAuth, (req: AuthRequest, res) => {
  res.json({ userId: req.userId, email: req.userEmail })
})

export default router
