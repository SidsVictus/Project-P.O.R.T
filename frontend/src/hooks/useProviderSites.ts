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
    queryFn: async () => {
      const result = await api.get<ProviderSite[]>('/api/provider-sites')
      return Array.isArray(result) ? result : []
    },
    retry: 2,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  })
}
