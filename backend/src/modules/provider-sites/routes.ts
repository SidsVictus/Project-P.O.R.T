import { Router } from 'express'
import { requireAuth } from '../auth/middleware'
import { fetchProviderSites } from './service'
import { AuthRequest } from '../../shared/types'
import { Provider } from '../../shared/types'

const router = Router()

const VALID_PROVIDERS: Provider[] = ['surge', 'netlify', 'vercel', 'cloudflare', 'firebase', 'github']

router.get('/:provider', requireAuth, async (req: AuthRequest, res) => {
  try {
    const provider = req.params.provider as Provider
    if (!VALID_PROVIDERS.includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' })
    }
    const sites = await fetchProviderSites(req.userId!, provider)
    res.json(sites)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch provider sites' })
  }
})

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const results = await Promise.allSettled(
      VALID_PROVIDERS.map((p) => fetchProviderSites(req.userId!, p))
    )
    const allSites = results
      .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value)
    res.json(allSites)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch provider sites' })
  }
})

export default router
