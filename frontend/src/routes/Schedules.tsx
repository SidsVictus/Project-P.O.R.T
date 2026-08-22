import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { useSchedules, useCreateSchedule, useDeleteSchedule } from '../hooks/useSchedule'
import { useSites } from '../hooks/useSites'
import toast from 'react-hot-toast'
import { formatDateTime } from '../lib/utils'

export function Schedules() {
  const { data: schedules } = useSchedules()
  const { data: sites } = useSites()
  const createSchedule = useCreateSchedule()
  const deleteSchedule = useDeleteSchedule()
  const [siteId, setSiteId] = useState('')
  const [nextRun, setNextRun] = useState('')

  const handleCreate = async () => {
    if (!siteId || !nextRun) return toast.error('Select a site and time')
    await createSchedule.mutateAsync({ siteId, nextRun: new Date(nextRun).toISOString() })
    toast.success('Schedule created')
    setSiteId('')
    setNextRun('')
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-brand-red">Schedules</h1>
        <p className="text-muted-foreground">Automate deployments at specific times</p>
      </div>

      <div className="pl-6">
        <h2 className="text-lg font-semibold mb-3">New Schedule</h2>
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
              <Label>Deploy At</Label>
              <Input type="datetime-local" value={nextRun} onChange={(e) => setNextRun(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleCreate} disabled={!siteId || !nextRun}>
            <Plus className="h-4 w-4 mr-2" /> Schedule Deploy
          </Button>
        </div>
      </div>

      <div className="pl-6">
        <h2 className="text-lg font-semibold mb-3">Scheduled Deploys</h2>
        {(schedules as any[])?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No schedules yet</p>
        ) : (
          <div className="space-y-2">
            {(schedules as any[])?.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/30 hover:bg-white/40 transition-colors">
                <div>
                  <p className="text-sm font-medium">{s.sites?.name || 'Unknown site'}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.next_run ? `Next: ${formatDateTime(s.next_run)}` : 'No date set'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.is_active ? 'success' : 'secondary'}>
                    {s.is_active ? 'Active' : 'Paused'}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => { deleteSchedule.mutate(s.id); toast.success('Schedule removed') }}>
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
