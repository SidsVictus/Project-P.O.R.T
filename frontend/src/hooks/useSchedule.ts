import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useSchedules() {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: () => api.get('/api/schedules'),
  })
}

export function useCreateSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { siteId: string; cronExpression?: string; nextRun?: string }) =>
      api.post('/api/schedules', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  })
}

export function useDeleteSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/schedules/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  })
}
