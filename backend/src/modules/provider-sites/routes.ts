import { Router } from 'express'
import { requireAuth } from '../auth/middleware'
import { fetchProviderSites } from './service'
import { getAllCredentials } from '../credentials/service'
import { AuthRequest } from '../../shared/types'
import { Provider } from '../../shared/types'

// ============================================================================
// WARNING: THIS ROUTE HANDLES CLI SITE DISCOVERY FOR ALL CONNECTED PROVIDERS.
// This fetches and lists all existing sites from a user's hosting accounts
// (Surge, Netlify, Vercel, Cloudflare, Firebase, GitHub Pages).
// It is used by the "Existing Sites" section on the Dashboard.
// DO NOT MODIFY, DELETE, OR REFACTOR THIS FILE WITHOUT EXPLICIT USER APPROVAL.
// ============================================================================

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

// GET /api/provider-sites - Lists all sites across all connected hosting providers.
// This endpoint reads the user's stored credentials, queries each provider's API,
// and returns a unified list of sites. Used by the Dashboard "Existing Sites" section.
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const creds = await getAllCredentials(req.userId!)
    const connected: Provider[] = creds.map((c: any) => c.provider)
    const hasEnvSurge = !!process.env.SURGE_TOKEN
    if (hasEnvSurge && !connected.includes('surge')) connected.push('surge')

    console.log('[provider-sites] userId:', req.userId, 'creds:', connected, 'envSurge:', hasEnvSurge)

    if (connected.length === 0) return res.json([])

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

    const failed = results.filter((r) => r.status === 'rejected')
    if (failed.length) console.log('[provider-sites] failed:', failed.map((f: any) => f.reason?.message))

    console.log('[provider-sites] result count:', allSites.length)
    res.json(allSites)
  } catch (error: any) {
    console.error('[provider-sites] error:', error.message)
    res.status(500).json({ error: error.message || 'Failed to fetch provider sites' })
  }
})

export default router
