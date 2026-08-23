import { useDeployStore } from '../../stores/deployStore'
import { useAuthStore } from '../../stores/authStore'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Calendar } from 'lucide-react'
import { useRef } from 'react'
import { useTemplates } from '../../hooks/useTemplates'

export function DeployConfig() {
  const { siteName, setSiteName, hostingEmail, setHostingEmail, scheduledAt, setScheduledAt, showTerminal, setShowTerminal, provider, setProvider } = useDeployStore()
  const { user } = useAuthStore()
  const dateRef = useRef<HTMLInputElement>(null)
  const { data: templates } = useTemplates()
  const templateList = (templates as any[]) || []

  const applyTemplate = (templateId: string) => {
    const t = templateList.find((t: any) => t.id === templateId)
    if (t) {
      setProvider(t.provider)
      if (t.config?.hostingEmail) setHostingEmail(t.config.hostingEmail)
    }
  }

  return (
    <div className="space-y-6">
      {templateList.length > 0 && (
        <div className="space-y-2">
          <Label>Apply Template <span className="text-xs text-muted-foreground">(optional)</span></Label>
          <select
            onChange={(e) => { if (e.target.value) applyTemplate(e.target.value) }}
            defaultValue=""
            className="w-full h-10 rounded-lg border border-border bg-secondary/50 px-3 text-sm"
          >
            <option value="" disabled>Choose a template...</option>
            {templateList.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="siteName">
          Site Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="siteName"
          placeholder="my-awesome-site"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          className="bg-secondary/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Hosting Email <span className="text-xs text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder={`Leave blank to use ${user?.email || 'your login email'}`}
          value={hostingEmail}
          onChange={(e) => setHostingEmail(e.target.value)}
          className="bg-secondary/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="schedule">
          Deploy Time <span className="text-xs text-muted-foreground">(optional)</span>
        </Label>
        <div className="relative">
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            onClick={() => dateRef.current?.showPicker()}
          />
          <input
            ref={dateRef}
            id="schedule"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 pl-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <p className="text-xs text-muted-foreground">Leave empty for instant deployment</p>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
        <div>
          <p className="text-sm font-medium">See the backend running</p>
          <p className="text-xs text-muted-foreground">Show live terminal output during deployment</p>
        </div>
        <Switch checked={showTerminal} onCheckedChange={setShowTerminal} />
      </div>
    </div>
  )
}
