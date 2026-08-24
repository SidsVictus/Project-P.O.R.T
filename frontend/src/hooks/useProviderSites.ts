import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

// ============================================================================
// WARNING: THIS HOOK FETCHES CLI SITES FROM ALL CONNECTED HOSTING PROVIDERS.
// It queries GET /api/provider-sites which discovers existing sites from
// Surge, Netlify, Vercel, Cloudflare, Firebase, and GitHub Pages accounts.
// Used by the Dashboard "Existing Sites" section.
// DO NOT MODIFY, DELETE, OR REFACTOR THIS FILE WITHOUT EXPLICIT USER APPROVAL.
// ============================================================================

export interface ProviderSite {
  name: string
  url: string
  provider: string
  updatedAt: string | null
}

export function useProviderSites() {
  return useQuery<ProviderSite[]>({
    queryKey: ['provider-sites'],
    queryFn: async () => {
      const result = await api.get<ProviderSite[]>('/api/provider-sites')
      return Array.isArray(result) ? result : []
    },
    retry: 2,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  })
}
