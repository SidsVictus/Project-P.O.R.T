import { Router, Response } from 'express'
import { z } from 'zod'
import { requireAuth } from '../auth/middleware'
import { createCustomProvider, getCustomProviders, deleteCustomProvider } from './service'
import { AuthRequest } from '../../shared/types'

const router = Router()

const createSchema = z.object({
  name: z.string().min(1).max(50),
  token: z.string().min(1),
  email: z.string().email().optional(),
})

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const providers = await getCustomProviders(req.userId!)
    res.json(providers)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch custom providers' })
  }
})

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createSchema.parse(req.body)
    const provider = await createCustomProvider(req.userId!, parsed.name, parsed.token, parsed.email)
    res.json({ id: provider.id, name: provider.name, email: provider.email })
  } catch (error) {
    res.status(400).json({ error: 'Failed to store custom provider' })
  }
})

router.delete('/:name', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await deleteCustomProvider(req.userId!, req.params.name)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete custom provider' })
  }
})

export default router
