import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, ExternalLink, TrendingUp, X, ArrowUpRight, RotateCcw, Trash2, Clock, Globe, FolderOpen, HelpCircle } from 'lucide-react'
import { useSites, useDeleteSite } from '../hooks/useSites'
import { useProviderSites, ProviderSite } from '../hooks/useProviderSites'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { formatDate, PROVIDERS } from '../lib/utils'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ProviderIcon } from '../components/ui/ProviderIcon'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

function MiniChart({ siteId }: { siteId: string }) {
  const { data } = useQuery({
    queryKey: ['analytics', siteId],
    queryFn: () => api.get(`/api/analytics/${siteId}`),
  })
  const analytics = (data as any[]) || []
  const chartData = analytics.slice(0, 7).reverse().map((d: any) => ({
    date: new Date(d.recorded_at).toLocaleDateString('en', { weekday: 'short' }),
    visits: d.visits || 0,
  }))

  if (chartData.length < 2) {
    return (
      <div className="h-14 w-full flex items-center justify-center">
        <p className="text-[10px] text-muted-foreground">No analytics yet</p>
      </div>
    )
  }

  return (
    <div className="h-14 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`g-${siteId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(225, 70%, 55%)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(225, 70%, 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="visits" stroke="hsl(225, 70%, 55%)" strokeWidth={2} fill={`url(#g-${siteId})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function ChartModal({ onClose }: { onClose: () => void }) {
  const [range, setRange] = useState(30)
  const { data: sites } = useSites()
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics-all', range],
    queryFn: async () => {
      if (!sites?.length) return []
      const results = await Promise.all(
        sites.map((s: any) => api.get(`/api/analytics/${s.id}`))
      )
      return (results as any[]).flat()
    },
    enabled: !!sites?.length,
  })

  const allAnalytics = (analyticsData as any[]) || []
  const chartData = allAnalytics.slice(-range).map((d: any) => ({
    date: new Date(d.recorded_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    visits: d.visits || 0,
    unique: d.unique_visitors || 0,
  }))

  const totalVisits = chartData.reduce((s, d) => s + d.visits, 0)
  const totalUnique = chartData.reduce((s, d) => s + d.unique, 0)
  const avgDaily = chartData.length ? Math.round(totalVisits / chartData.length) : 0

  return (
    <div className="chart-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass rounded-3xl p-8 w-full max-w-3xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold">Site Analytics</h3>
            <p className="text-muted-foreground text-sm">Traffic overview over time</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary/80 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {[7, 14, 30].map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${range === r ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary/80 text-muted-foreground hover:bg-secondary'}`}
            >{r} days</button>
          ))}
        </div>

        {chartData.length === 0 ? (
          <div className="h-72 flex items-center justify-center">
            <p className="text-muted-foreground">No analytics data yet. Deploy a site to start tracking.</p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="mgV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(225,70%,55%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(225,70%,55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="mgU" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(198,80%,50%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(198,80%,50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={35} />
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid hsl(220,16%,88%)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', fontSize: '13px' }} />
                <Area type="monotone" dataKey="visits" name="Total Visits" stroke="hsl(225,70%,55%)" strokeWidth={2.5} fill="url(#mgV)" />
                <Area type="monotone" dataKey="unique" name="Unique" stroke="hsl(198,80%,50%)" strokeWidth={2} fill="url(#mgU)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Total Visits', value: totalVisits.toLocaleString(), color: 'text-primary' },
            { label: 'Unique Visitors', value: totalUnique.toLocaleString(), color: 'text-accent' },
            { label: 'Avg Daily', value: avgDaily.toString(), color: 'text-emerald-600' },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-secondary/50">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const { data: sites, isLoading } = useSites()
  const { data: providerSites, isLoading: loadingProviders } = useProviderSites()
  const deleteSite = useDeleteSite()
  const [chartOpen, setChartOpen] = useState(false)

  const activeSites = sites?.filter((s) => s.status === 'active').length || 0
  const totalSites = sites?.length || 0

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-brand-red">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your deployed sites at a glance</p>
        </div>
        <Button onClick={() => navigate('/deploy')} className="rounded-full px-6 btn-glow">
          <Plus className="h-4 w-4 mr-2" /> New Deploy
        </Button>
      </div>

      {/* Stats - Chaotic Asymmetric */}
      <div className="relative pl-6">
        <div className="grid grid-cols-12 gap-4 items-start">
          {/* Huge hero stat */}
          <motion.div className="col-span-12 sm:col-span-7" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-2xl bg-white/30 backdrop-blur-sm border border-white/30 p-8 stat-card">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Sites</p>
              <p className="text-7xl font-extrabold tracking-tighter leading-none">{totalSites}</p>
              <p className="text-xs text-muted-foreground mt-3">{totalSites === 0 ? 'No sites deployed yet' : `Site${totalSites !== 1 ? 's' : ''} deployed`}</p>
            </div>
          </motion.div>

          {/* Stacked small cards */}
          <motion.div className="col-span-6 sm:col-span-3 -mt-2" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-2xl bg-white/30 backdrop-blur-sm border border-white/30 p-5 stat-card">
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-4xl font-bold tracking-tight">{activeSites}</p>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">All systems go</p>
            </div>
          </motion.div>

          <motion.div className="col-span-6 sm:col-span-2 mt-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="rounded-2xl bg-white/30 backdrop-blur-sm border border-white/30 p-5 stat-card">
              <p className="text-xs text-muted-foreground mb-1">Providers</p>
              <p className="text-4xl font-bold tracking-tight">{new Set(sites?.map((s) => s.provider)).size || 0}<span className="text-lg font-normal text-muted-foreground">/{6}</span></p>
            </div>
          </motion.div>
        </div>

        {/* Offset second row */}
        <div className="grid grid-cols-12 gap-4 items-start mt-3">
          <motion.div className="col-span-12 sm:col-span-5 sm:col-start-1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="rounded-2xl bg-white/30 backdrop-blur-sm border border-white/30 p-5 stat-card">
              <p className="text-xs text-muted-foreground">Last Deploy</p>
              <p className="text-xl font-bold tracking-tight">{sites?.length ? (() => { const d = new Date(sites.reduce((latest, s) => new Date(s.updated_at) > new Date(latest) ? s.updated_at : latest, sites[0].updated_at)); const hrs = Math.round((Date.now() - d.getTime()) / 3600000); return hrs < 1 ? 'Just now' : hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago` })() : '—'}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sites List — ALL sites (PORT-deployed + CLI/provider) */}
      <div className="pl-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Your Sites</h2>
            <p className="text-sm text-muted-foreground">Sites from your hosting accounts</p>
          </div>
        </div>

        {isLoading || loadingProviders ? (
            <div className="space-y-4">
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">It might take a min to load the sites...</p>
              </div>
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 w-full" />)}
            </div>
          ) : !sites?.length && !providerSites?.length ? (
            <div className="text-center py-16">
              <p className="text-lg font-medium mb-1">No sites yet</p>
              <p className="text-sm text-muted-foreground mb-6">Deploy your first site to get started</p>
              <Button onClick={() => navigate('/deploy')} className="rounded-full btn-glow">
                <Plus className="h-4 w-4 mr-2" /> Deploy First Site
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sites?.map((site, i) => {
                const provider = PROVIDERS.find((p) => p.id === site.provider)
                return (
                  <motion.div key={site.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/40 hover:bg-white/60 backdrop-blur-sm border border-white/30 transition-all duration-200 group"
                  >
                    <ProviderIcon provider={site.provider} size="md" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm truncate">{site.name}</h3>
                        <Badge variant={site.status === 'active' ? 'success' : 'destructive'} className="text-[10px] px-2 py-0">
                          {site.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {provider?.name} · {formatDate(site.created_at)}
                      </p>
                      {site.url && (
                        <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 font-mono">
                          <ArrowUpRight className="h-3 w-3" />{site.url}
                        </a>
                      )}
                    </div>

                    <div className="hidden sm:block w-24 shrink-0">
                      <MiniChart siteId={site.id} />
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {site.url && (
                        <a href={site.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/60 transition-colors">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      )}
                      <button onClick={() => navigate('/deploy')} className="p-2 rounded-lg hover:bg-white/60 transition-colors">
                        <RotateCcw className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button onClick={async () => { if (!confirm('Delete?')) return; await deleteSite.mutateAsync(site.id); toast.success('Deleted') }}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-destructive/60" />
                      </button>
                      <div className="relative group/tip">
                        <HelpCircle className="h-4 w-4 text-brand-red opacity-60 hover:opacity-100 transition-opacity cursor-default" />
                        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-[10px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-10">
                          Made with Project-P.O.R.T
                          <div className="absolute top-full right-2.5 -mt-1 w-2 h-2 bg-gray-900 rotate-45" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {/* CLI/provider sites — discovered from connected hosting accounts */}
              {loadingProviders ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => <div key={i} className="skeleton h-16 w-full" />)}
                </div>
              ) : (
                providerSites?.map((site, i) => {
                  const provider = PROVIDERS.find((p) => p.id === site.provider)
                  return (
                    <motion.div key={`${site.provider}-${site.name}`}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (sites?.length || 0) * 0.05 + i * 0.03 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/20 transition-all duration-200"
                    >
                      <ProviderIcon provider={site.provider} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{site.name}</p>
                        <p className="text-[10px] text-muted-foreground">{provider?.name}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {site.url && (
                          <a href={site.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 font-mono">
                            <ArrowUpRight className="h-3 w-3" />Visit
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          )}
      </div>

      <AnimatePresence>
        {chartOpen && <ChartModal onClose={() => setChartOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
