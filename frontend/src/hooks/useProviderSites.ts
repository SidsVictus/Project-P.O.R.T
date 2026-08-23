import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface ProviderSite {
  name: string
  url: string
  provider: string
  updatedAt: string | null
}

export interface ProviderSitesResponse {
  sites: ProviderSite[]
  debug?: any
}

export function useProviderSites() {
  return useQuery<ProviderSitesResponse>({
    queryKey: ['provider-sites'],
    queryFn: () => api.get('/api/provider-sites'),
    retry: false,
    staleTime: 60_000,
  })
}
