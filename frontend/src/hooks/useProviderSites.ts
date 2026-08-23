import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface ProviderSite {
  name: string
  url: string
  provider: string
  updatedAt: string | null
}

export function useProviderSites() {
  return useQuery<ProviderSite[]>({
    queryKey: ['provider-sites'],
    queryFn: () => api.get('/api/provider-sites'),
    retry: false,
    staleTime: 60_000,
  })
}
