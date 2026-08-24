import { useState } from 'react'
import { Plus, Trash2, Eye, EyeOff, Terminal } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { PROVIDERS } from '../lib/utils'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProviderIcon } from '../components/ui/ProviderIcon'
import { useCustomProviders, useAddCustomProvider, useDeleteCustomProvider } from '../hooks/useCustomProviders'

const PROVIDER_AUTH: Record<string, { fields: string[] }> = {
  surge: { fields: ['email', 'token'] },
  netlify: { fields: ['token'] },
  vercel: { fields: ['token'] },
  cloudflare: { fields: ['token'] },
  firebase: { fields: 'token' in [] ? ['token'] : ['token'] },
  github: { fields: ['token'] },
}

export function Settings() {
  const qc = useQueryClient()
  const [provider, setProvider] = useState('surge')
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [showToken, setShowToken] = useState(false)

  const [cliName, setCliName] = useState('')
  const [cliToken, setCliToken] = useState('')
  const [cliEmail, setCliEmail] = useState('')
  const [showCliToken, setShowCliToken] = useState(false)

  const { data: customProviders } = useCustomProviders()
  const addCli = useAddCustomProvider()
  const deleteCli = useDeleteCustomProvider()

  const isAddCli = provider === 'add-cli'
  const fields = isAddCli ? [] : (PROVIDER_AUTH[provider]?.fields || ['token'])

  const { data: credentials } = useQuery({
    queryKey: ['credentials'],
    queryFn: () => api.get('/api/credentials'),
  })

  const storeMutation = useMutation({
    mutationFn: () => {
      const payload: any = { provider }
      if (fields.includes('token')) payload.token = token
      if (fields.includes('email')) payload.email = email
      return api.post('/api/credentials', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credentials'] })
      setToken('')
      setEmail('')
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

  const isDisabled = isAddCli
    ? !cliName.trim() || !cliToken.trim()
    : fields.every((f) => {
        if (f === 'token') return !token
        if (f === 'email') return !email
        return true
      })

  const handleStore = () => {
    if (isAddCli) {
      addCli.mutate(
        { name: cliName.trim(), token: cliToken, email: cliEmail || undefined },
        {
          onSuccess: () => {
            setCliName('')
            setCliToken('')
            setCliEmail('')
            toast.success('Custom CLI saved')
          },
          onError: () => toast.error('Failed to save custom CLI'),
        }
      )
    } else {
      storeMutation.mutate()
    }
  }

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
              <select value={provider} onChange={(e) => { setProvider(e.target.value); setToken(''); setEmail('') }} className="w-full h-10 rounded-lg border border-border bg-secondary px-3 text-sm">
                {PROVIDERS.filter((p) => p.id !== 'custom').map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
                <option value="add-cli">+ Add CLI</option>
              </select>
            </div>

            {!isAddCli && fields.includes('token') && (
              <div className="space-y-2">
                <Label>API Token</Label>
                <div className="relative">
                  <Input type={showToken ? 'text' : 'password'} placeholder="your-api-token" value={token} onChange={(e) => setToken(e.target.value)} className="pr-10" />
                  <button type="button" onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-secondary/80 transition-colors">
                    {showToken ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>
            )}

            {!isAddCli && fields.includes('email') && (
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            )}

            {isAddCli && (
              <>
                <div className="space-y-2">
                  <Label>CLI Name</Label>
                  <Input placeholder="e.g. My Custom Host" value={cliName} onChange={(e) => setCliName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>API Token</Label>
                  <div className="relative">
                    <Input type={showCliToken ? 'text' : 'password'} placeholder="your-api-token" value={cliToken} onChange={(e) => setCliToken(e.target.value)} className="pr-10" />
                    <button type="button" onClick={() => setShowCliToken(!showCliToken)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-secondary/80 transition-colors">
                      {showCliToken ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input type="email" placeholder="your@email.com" value={cliEmail} onChange={(e) => setCliEmail(e.target.value)} />
                </div>
              </>
            )}
          </div>
          <Button onClick={handleStore} disabled={isDisabled || storeMutation.isPending || addCli.isPending}>
            <Plus className="h-4 w-4 mr-2" /> {isAddCli ? 'Save Custom CLI' : 'Add Credential'}
          </Button>
        </div>
      </div>

      <div className="pl-6">
        <h2 className="text-lg font-semibold mb-3">Stored Credentials</h2>
        {(credentials as any[])?.length === 0 && (!customProviders?.length) ? (
          <p className="text-sm text-muted-foreground">No credentials stored yet</p>
        ) : (
          <div className="space-y-2">
            {(credentials as any[])?.map((cred: any) => (
              <div key={cred.id} className="flex items-center justify-between p-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/30 hover:bg-white/40 transition-colors">
                <div className="flex items-center gap-3">
                  <ProviderIcon provider={cred.provider} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{PROVIDERS.find((p) => p.id === cred.provider)?.name}</p>
                    <p className="text-xs text-muted-foreground">{cred.email || 'Token stored'}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(cred.provider)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}

            {customProviders?.map((cp) => (
              <div key={cp.id} className="flex items-center justify-between p-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/30 hover:bg-white/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Terminal className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{cp.name}</p>
                    <p className="text-xs text-muted-foreground">{cp.email || 'Token stored'}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteCli.mutate(cp.name)}>
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
