import { useSites } from '../hooks/useSites'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'
import { ProviderIcon } from '../components/ui/ProviderIcon'

export function Analytics() {
  const { data: sites, isLoading } = useSites()
  const siteList = (sites as any[]) || []

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-brand-red">Analytics</h1>
        <p className="text-muted-foreground">Track visits to your deployed sites</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => <div key={i} className="skeleton h-64 w-full rounded-2xl" />)}
        </div>
      ) : siteList.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-medium mb-1">No sites yet</p>
          <p className="text-sm text-muted-foreground">Deploy a site first to see analytics</p>
        </div>
      ) : (
        <div className="space-y-8">
          {siteList.map((site: any, i: number) => (
            <SiteAnalytics key={site.id} site={site} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function SiteAnalytics({ site, index }: { site: any; index: number }) {
  const { data: analytics } = useQuery({
    queryKey: ['analytics', site.id],
    queryFn: () => api.get(`/api/analytics/${site.id}`),
  })

  const { data: summary } = useQuery({
    queryKey: ['analytics-summary', site.id],
    queryFn: () => api.get(`/api/analytics/${site.id}/summary`),
  })

  const allData = (analytics as any[]) || []
  const chartData = allData.slice(-14).map((d: any) => ({
    date: new Date(d.recorded_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    visits: d.visits || 0,
    unique: d.unique_visitors || 0,
  }))

  const barData = allData.slice(-7).map((d: any) => ({
    day: new Date(d.recorded_at).toLocaleDateString('en', { weekday: 'short' }),
    visits: d.visits || 0,
  }))

  const totalVisits = (summary as any)?.totalVisits || 0
  const totalUnique = (summary as any)?.totalUnique || 0
  const avgDaily = chartData.length ? Math.round(totalVisits / chartData.length) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-2xl bg-white/30 backdrop-blur-sm border border-white/30 p-6 space-y-5"
    >
      <div className="flex items-center gap-3">
        <ProviderIcon provider={site.provider} size="sm" />
        <div>
          <h3 className="text-lg font-semibold">{site.name}</h3>
          <p className="text-xs text-muted-foreground">{site.provider}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-xl bg-white/40 border border-white/30">
          <p className="text-2xl font-bold text-primary">{totalVisits}</p>
          <p className="text-[11px] text-muted-foreground">Total Visits</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/40 border border-white/30">
          <p className="text-2xl font-bold text-accent">{totalUnique}</p>
          <p className="text-[11px] text-muted-foreground">Unique Visitors</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/40 border border-white/30">
          <p className="text-2xl font-bold text-emerald-600">{avgDaily}</p>
          <p className="text-[11px] text-muted-foreground">Avg Daily</p>
        </div>
      </div>

      {chartData.length >= 2 ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Visits Over Time</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={`visit-${site.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(225,70%,55%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(225,70%,55%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id={`unique-${site.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(198,80%,50%)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(198,80%,50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,88%)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid hsl(220,16%,88%)', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="visits" name="Visits" stroke="hsl(225,70%,55%)" strokeWidth={2} fill={`url(#visit-${site.id})`} />
                  <Area type="monotone" dataKey="unique" name="Unique" stroke="hsl(198,80%,50%)" strokeWidth={2} fill={`url(#unique-${site.id})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Last 7 Days</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,88%)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={25} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid hsl(220,16%,88%)', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontSize: '12px' }} />
                  <Bar dataKey="visits" name="Visits" fill="hsl(225,70%,55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center rounded-xl bg-white/20 border border-white/20">
          <p className="text-sm text-muted-foreground">Not enough data yet. Charts appear after 2+ data points.</p>
        </div>
      )}
    </motion.div>
  )
}
