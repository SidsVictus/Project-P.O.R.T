import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { requireAuth } from '../auth/middleware'
import { storeCredential, getAllCredentials, deleteCredential } from './service'
import { Provider, AuthRequest } from '../../shared/types'

const router = Router()

const storeSchema = z.object({
  provider: z.enum(['surge', 'netlify', 'vercel', 'cloudflare', 'firebase', 'github', 'custom']),
  token: z.string().min(1),
  email: z.string().email().optional(),
})

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const creds = await getAllCredentials(req.userId!)
    res.json(creds)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch credentials' })
  }
})

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = storeSchema.parse(req.body)
    const cred = await storeCredential(req.userId!, parsed.provider as Provider, parsed.token, parsed.email)
    res.json({ id: cred.id, provider: cred.provider, email: cred.email })
  } catch (error) {
    res.status(400).json({ error: 'Failed to store credential' })
  }
})

router.delete('/:provider', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await deleteCredential(req.userId!, req.params.provider as Provider)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete credential' })
  }
})

export default router
