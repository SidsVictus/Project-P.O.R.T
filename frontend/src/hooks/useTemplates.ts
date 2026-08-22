import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: () => api.get('/api/templates'),
  })
}

export function useCreateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; provider: string; config: Record<string, unknown> }) =>
      api.post('/api/templates', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  })
}

export function useDeleteTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/templates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  })
}
