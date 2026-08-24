import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface CustomProvider {
  id: string
  user_id: string
  name: string
  email?: string
  created_at: string
}

export function useCustomProviders() {
  return useQuery<CustomProvider[]>({
    queryKey: ['custom-providers'],
    queryFn: () => api.get<CustomProvider[]>('/api/custom-providers'),
  })
}

export function useAddCustomProvider() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; token: string; email?: string }) =>
      api.post('/api/custom-providers', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-providers'] }),
  })
}

export function useDeleteCustomProvider() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => api.delete(`/api/custom-providers/${encodeURIComponent(name)}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-providers'] }),
  })
}
