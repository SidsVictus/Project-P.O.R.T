import { ExternalLink, Trash2, RotateCcw } from 'lucide-react'
import { Badge } from '../ui/badge'
import { ProviderIcon } from '../ui/ProviderIcon'
import { Site } from '../../../../shared/types'
import { formatDate, PROVIDERS } from '../../lib/utils'
import { useDeleteSite } from '../../hooks/useSites'
import toast from 'react-hot-toast'

interface SiteCardProps {
  site: Site
}

export function SiteCard({ site }: SiteCardProps) {
  const deleteSite = useDeleteSite()
  const provider = PROVIDERS.find((p) => p.id === site.provider)

  const handleDelete = async () => {
    if (!confirm('Delete this site?')) return
    await deleteSite.mutateAsync(site.id)
    toast.success('Site deleted')
  }

  return (
    <div className="group glass glass-hover rounded-2xl p-5 transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <ProviderIcon provider={site.provider} size="md" />
          <div>
            <h3 className="font-semibold text-foreground">{site.name}</h3>
            <p className="text-xs text-muted-foreground">{provider?.name} · {formatDate(site.created_at)}</p>
          </div>
        </div>
        <Badge variant={site.status === 'active' ? 'success' : site.status === 'failed' ? 'destructive' : 'secondary'}>
          <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${site.status === 'active' ? 'bg-emerald-500' : site.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'}`} />
          {site.status}
        </Badge>
      </div>

      {site.url && (
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-1.5 text-sm text-primary hover:underline font-mono"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {site.url}
        </a>
      )}

      <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <a href={site.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          <ExternalLink className="h-3 w-3" /> Visit
        </a>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors">
          <RotateCcw className="h-3 w-3" /> Redeploy
        </button>
        <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors ml-auto">
          <Trash2 className="h-3 w-3" /> Delete
        </button>
      </div>
    </div>
  )
}
