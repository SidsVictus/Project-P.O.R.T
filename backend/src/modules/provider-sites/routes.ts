import { Router } from 'express'
import { requireAuth } from '../auth/middleware'
import { fetchProviderSites } from './service'
import { getAllCredentials, getCredential } from '../credentials/service'
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
    const creds = await getAllCredentials(req.userId!)
    const connected: Provider[] = creds.map((c: any) => c.provider)
    const hasEnvSurge = !!process.env.SURGE_TOKEN
    if (hasEnvSurge && !connected.includes('surge')) connected.push('surge')

    const debug: any = { connected, hasEnvSurge, credCount: creds.length }

    if (connected.length === 0) return res.json([])

    const surgeCred = await getCredential(req.userId!, 'surge')
    debug.surgeCredFound = !!surgeCred
    debug.surgeTokenLen = surgeCred?.token?.length || 0

    const results = await Promise.allSettled(
      connected.map((p) =>
        Promise.race([
          fetchProviderSites(req.userId!, p),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
        ])
      )
    )
    const allSites = results
      .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value)
    const errors = results
      .map((r, i) => r.status === 'rejected' ? `${connected[i]}: ${r.reason?.message}` : null)
      .filter(Boolean)
    debug.errors = errors
    debug.siteCount = allSites.length

    res.json({ sites: allSites, debug })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch provider sites' })
  }
})

export default router
