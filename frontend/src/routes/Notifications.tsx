import { Bell, Rocket, AlertTriangle, RefreshCw, Bug } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useAuthStore } from '../stores/authStore'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

const ICONS: Record<string, any> = {
  deploy_success: Rocket,
  deploy_failed: AlertTriangle,
  redeploy: RefreshCw,
  error: Bug,
}

const COLORS: Record<string, string> = {
  deploy_success: 'text-emerald-500',
  deploy_failed: 'text-red-500',
  redeploy: 'text-blue-500',
  error: 'text-amber-500',
}

export function Notifications() {
  const { user } = useAuthStore()
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/api/notifications'),
  })

  const items = (notifications as any[]) || []

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Alerts sent to {user?.email}</p>
      </div>

      <Card className="glass">
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">Deploy something to get alerts</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {items.map((n: any) => {
                const Icon = ICONS[n.type] || Bell
                return (
                  <div key={n.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                    <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${COLORS[n.type] || 'text-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={n.type === 'deploy_failed' || n.type === 'error' ? 'destructive' : 'secondary'} className="text-[10px] shrink-0">
                      {n.type.replace('_', ' ')}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
