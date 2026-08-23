import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useTemplates, useCreateTemplate, useDeleteTemplate } from '../hooks/useTemplates'
import { PROVIDERS } from '../lib/utils'
import toast from 'react-hot-toast'

export function Templates() {
  const { data: templates } = useTemplates()
  const createTemplate = useCreateTemplate()
  const deleteTemplate = useDeleteTemplate()
  const [name, setName] = useState('')
  const [provider, setProvider] = useState('surge')
  const [email, setEmail] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Enter template name')
    await createTemplate.mutateAsync({ name, provider, config: { hostingEmail: email || undefined } })
    toast.success('Template created')
    setName('')
    setEmail('')
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-brand-red">Templates</h1>
        <p className="text-muted-foreground">Save deploy configs for quick reuse</p>
      </div>

      <div className="pl-6">
        <h2 className="text-lg font-semibold mb-3">Create Template</h2>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="My deploy template" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Provider</Label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full h-10 rounded-lg border border-border bg-secondary px-3 text-sm">
                {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Hosting Email <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            <Plus className="h-4 w-4 mr-2" /> Save Template
          </Button>
        </div>
      </div>

      <div className="pl-6">
        <h2 className="text-lg font-semibold mb-3">Your Templates</h2>
        {(templates as any[])?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No templates yet</p>
        ) : (
          <div className="space-y-2">
            {(templates as any[])?.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/30 hover:bg-white/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{t.name}</span>
                  <span className="text-xs text-muted-foreground">{PROVIDERS.find((p) => p.id === t.provider)?.name}</span>
                  {t.config?.hostingEmail && <span className="text-xs text-muted-foreground">{t.config.hostingEmail}</span>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => { deleteTemplate.mutate(t.id); toast.success('Template deleted') }}>
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
