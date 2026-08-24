import { useState } from 'react'
import { cn, PROVIDERS } from '../../lib/utils'
import { useDeployStore } from '../../stores/deployStore'
import { Provider } from '../../../../shared/types'
import { useCustomProviders, useAddCustomProvider, CustomProvider } from '../../hooks/useCustomProviders'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Plus, Eye, EyeOff, Terminal } from 'lucide-react'
import toast from 'react-hot-toast'

export function ProviderSelect() {
  const { provider, setProvider, customCliName, setCustomCliName } = useDeployStore()
  const { data: customProviders, isLoading } = useCustomProviders()
  const addCli = useAddCustomProvider()
  const [showForm, setShowForm] = useState(false)
  const [cliName, setCliName] = useState('')
  const [cliToken, setCliToken] = useState('')
  const [cliEmail, setCliEmail] = useState('')
  const [showCliToken, setShowCliToken] = useState(false)

  const isCustomSelected = provider === 'custom'

  const handleCustomClick = () => {
    if (customProviders && customProviders.length > 0) {
      setProvider('custom' as Provider)
      setCustomCliName(null)
    } else {
      setProvider('custom' as Provider)
      setShowForm(true)
      setCustomCliName(null)
    }
  }

  const handleSelectSavedCli = (cp: CustomProvider) => {
    setCustomCliName(cp.name)
  }

  const handleAddNewCli = () => {
    if (!cliName.trim() || !cliToken.trim()) return
    addCli.mutate(
      { name: cliName.trim(), token: cliToken, email: cliEmail || undefined },
      {
        onSuccess: () => {
          setCustomCliName(cliName.trim())
          setCliName('')
          setCliToken('')
          setCliEmail('')
          setShowForm(false)
          toast.success('Custom CLI saved')
        },
      }
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PROVIDERS.filter((p) => p.id !== 'custom').map((p: (typeof PROVIDERS)[number]) => (
          <button
            key={p.id}
            onClick={() => { setProvider(p.id as Provider); setCustomCliName(null) }}
            className={cn(
              'flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200',
              provider === p.id && !isCustomSelected
                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.03] ring-1 ring-primary/20'
                : 'border-white/20 bg-white/30 hover:border-white/40 hover:bg-white/50 hover:scale-[1.01]'
            )}
          >
            {p.iconUrl ? (
              <img src={p.iconUrl} alt={p.name} className="h-10 w-10 object-contain" draggable={false} />
            ) : (
              <span className="text-2xl font-bold text-primary">{p.icon}</span>
            )}
            <div className="text-center">
              <span className={cn('text-sm font-semibold block', provider === p.id && !isCustomSelected && 'text-primary')}>{p.name}</span>
              <span className="text-[11px] text-muted-foreground">{p.freeTier}</span>
            </div>
            {provider === p.id && !isCustomSelected && (
              <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Selected</span>
            )}
          </button>
        ))}

        <button
          onClick={handleCustomClick}
          className={cn(
            'flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200',
            isCustomSelected
              ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.03] ring-1 ring-primary/20'
              : 'border-white/20 bg-white/30 hover:border-white/40 hover:bg-white/50 hover:scale-[1.01]'
          )}
        >
          <span className="text-2xl font-bold text-primary">+</span>
          <div className="text-center">
            <span className={cn('text-sm font-semibold block', isCustomSelected && 'text-primary')}>Custom CLI</span>
            <span className="text-[11px] text-muted-foreground">Varies</span>
          </div>
          {isCustomSelected && (
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Selected</span>
          )}
        </button>
      </div>

      {isCustomSelected && (
        <div className="p-4 rounded-xl border border-white/20 bg-white/20 backdrop-blur-sm space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading custom CLIs...</p>
          ) : customProviders && customProviders.length > 0 && !showForm ? (
            <div className="space-y-2">
              <Label>Select a saved CLI</Label>
              <div className="space-y-1">
                {customProviders.map((cp) => (
                  <button
                    key={cp.id}
                    onClick={() => handleSelectSavedCli(cp)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                      customCliName === cp.name
                        ? 'border-primary bg-primary/5'
                        : 'border-white/20 hover:border-white/40 hover:bg-white/20'
                    )}
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Terminal className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cp.name}</p>
                      <p className="text-[10px] text-muted-foreground">{cp.email || 'Token stored'}</p>
                    </div>
                    {customCliName === cp.name && (
                      <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">Selected</span>
                    )}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowForm(true)} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                <Plus className="h-3 w-3" /> Add another CLI
              </button>
            </div>
          ) : showForm ? (
            <div className="space-y-3">
              <Label>Add Custom CLI</Label>
              <Input placeholder="CLI name (e.g. My Host)" value={cliName} onChange={(e) => setCliName(e.target.value)} />
              <div className="relative">
                <Input type={showCliToken ? 'text' : 'password'} placeholder="API Token" value={cliToken} onChange={(e) => setCliToken(e.target.value)} className="pr-10" />
                <button type="button" onClick={() => setShowCliToken(!showCliToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-secondary/80 transition-colors">
                  {showCliToken ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
              <Input type="email" placeholder="Email (optional)" value={cliEmail} onChange={(e) => setCliEmail(e.target.value)} />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button size="sm" onClick={handleAddNewCli} disabled={!cliName.trim() || !cliToken.trim() || addCli.isPending}>
                  {addCli.isPending ? 'Saving...' : 'Save & Select'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground mb-2">No custom CLIs added yet</p>
              <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add your first CLI
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
