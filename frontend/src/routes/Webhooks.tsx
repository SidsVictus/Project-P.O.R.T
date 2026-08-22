import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useSites } from '../hooks/useSites'
import toast from 'react-hot-toast'

export function Webhooks() {
  const qc = useQueryClient()
  const { data: sites } = useSites()
  const { data: webhooks } = useQuery({ queryKey: ['webhooks'], queryFn: () => api.get('/api/webhooks') })
  const [siteId, setSiteId] = useState('')
  const [repo, setRepo] = useState('')
  const [branch, setBranch] = useState('main')
  const [secret, setSecret] = useState('')

  const createMutation = useMutation({
    mutationFn: () => api.post('/api/webhooks', { siteId, githubRepo: repo, branch, secret, isActive: true }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['webhooks'] }); toast.success('Webhook created'); setRepo(''); setSecret('') },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/webhooks/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['webhooks'] }); toast.success('Webhook deleted') },
  })

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-brand-red">Webhooks</h1>
        <p className="text-muted-foreground">Auto-deploy on every GitHub push</p>
      </div>

      <div className="pl-6">
        <h2 className="text-lg font-semibold mb-3">Add GitHub Webhook</h2>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Site</Label>
              <select value={siteId} onChange={(e) => setSiteId(e.target.value)} className="w-full h-10 rounded-lg border border-border bg-secondary px-3 text-sm">
                <option value="">Select a site</option>
                {(sites as any[])?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>GitHub Repo</Label>
              <Input placeholder="user/repo" value={repo} onChange={(e) => setRepo(e.target.value)} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Branch</Label>
              <Input placeholder="main" value={branch} onChange={(e) => setBranch(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Webhook Secret</Label>
              <Input type="password" placeholder="min 8 characters" value={secret} onChange={(e) => setSecret(e.target.value)} />
            </div>
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={!siteId || !repo || !secret}>
            <Plus className="h-4 w-4 mr-2" /> Create Webhook
          </Button>
        </div>
      </div>

      <div className="pl-6">
        <h2 className="text-lg font-semibold mb-3">Active Webhooks</h2>
        {(webhooks as any[])?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No webhooks yet</p>
        ) : (
          <div className="space-y-2">
            {(webhooks as any[])?.map((w: any) => (
              <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/30 hover:bg-white/40 transition-colors">
                <div>
                  <p className="text-sm font-medium">{w.sites?.name || w.github_repo}</p>
                  <p className="text-xs text-muted-foreground">{w.branch} branch</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={w.is_active ? 'success' : 'secondary'}>
                    {w.is_active ? 'Active' : 'Paused'}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(w.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
