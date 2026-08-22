import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { PROVIDERS } from '../lib/utils'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProviderIcon } from '../components/ui/ProviderIcon'

const PROVIDER_AUTH: Record<string, { fields: string[] }> = {
  surge: { fields: ['email', 'password'] },
  netlify: { fields: ['token'] },
  vercel: { fields: ['token'] },
  cloudflare: { fields: ['token'] },
  firebase: { fields: ['token'] },
  github: { fields: ['token'] },
}

export function Settings() {
  const qc = useQueryClient()
  const [provider, setProvider] = useState('surge')
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const fields = PROVIDER_AUTH[provider]?.fields || ['token']

  const { data: credentials } = useQuery({
    queryKey: ['credentials'],
    queryFn: () => api.get('/api/credentials'),
  })

  const storeMutation = useMutation({
    mutationFn: () => {
      const payload: any = { provider }
      if (fields.includes('token')) payload.token = token
      if (fields.includes('email')) payload.email = email
      if (fields.includes('password')) payload.password = password
      return api.post('/api/credentials', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credentials'] })
      setToken('')
      setEmail('')
      setPassword('')
      toast.success('Credential stored securely')
    },
    onError: () => toast.error('Failed to store credential'),
  })

  const deleteMutation = useMutation({
    mutationFn: (p: string) => api.delete(`/api/credentials/${p}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credentials'] })
      toast.success('Credential removed')
    },
  })

  const isDisabled = fields.every((f) => {
    if (f === 'token') return !token
    if (f === 'email') return !email
    if (f === 'password') return !password
    return true
  })

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-brand-red">Settings</h1>
        <p className="text-muted-foreground">Manage credentials and preferences</p>
      </div>

      <div className="pl-6">
        <h2 className="text-lg font-semibold mb-3">Provider Credentials</h2>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <select value={provider} onChange={(e) => { setProvider(e.target.value); setToken(''); setEmail(''); setPassword('') }} className="w-full h-10 rounded-lg border border-border bg-secondary px-3 text-sm">
                {PROVIDERS.filter((p) => p.id !== 'custom').map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            {fields.includes('token') && (
              <div className="space-y-2">
                <Label>API Token</Label>
                <Input type="password" placeholder="your-api-token" value={token} onChange={(e) => setToken(e.target.value)} />
              </div>
            )}
            {fields.includes('email') && (
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            )}
            {fields.includes('password') && (
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" placeholder="your-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}
          </div>
          <Button onClick={() => storeMutation.mutate()} disabled={isDisabled || storeMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" /> Add Credential
          </Button>
        </div>
      </div>

      <div className="pl-6">
        <h2 className="text-lg font-semibold mb-3">Stored Credentials</h2>
        {(credentials as any[])?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No credentials stored yet</p>
        ) : (
          <div className="space-y-2">
            {(credentials as any[])?.map((cred: any) => (
              <div key={cred.id} className="flex items-center justify-between p-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/30 hover:bg-white/40 transition-colors">
                <div className="flex items-center gap-3">
                  <ProviderIcon provider={cred.provider} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{PROVIDERS.find((p) => p.id === cred.provider)?.name}</p>
                    <p className="text-xs text-muted-foreground">{cred.email || 'API token stored'}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(cred.provider)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
