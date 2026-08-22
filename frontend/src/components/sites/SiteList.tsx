import { SiteCard } from './SiteCard'
import { EmptyState } from './EmptyState'
import { Site } from '../../../../shared/types'

interface SiteListProps {
  sites: Site[]
}

export function SiteList({ sites }: SiteListProps) {
  if (!sites.length) return <EmptyState />

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sites.map((site) => (
        <SiteCard key={site.id} site={site} />
      ))}
    </div>
  )
}
