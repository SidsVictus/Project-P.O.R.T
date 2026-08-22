import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Site } from '../../../shared/types'

export function useSites() {
  return useQuery<Site[]>({
    queryKey: ['sites'],
    queryFn: () => api.get('/api/sites'),
  })
}

export function useDeleteSite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/sites/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sites'] }),
  })
}
