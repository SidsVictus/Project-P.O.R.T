import { PROVIDERS } from '../../lib/utils'
import { Provider } from '../../../../shared/types'

interface ProviderIconProps {
  provider: Provider | string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-12 w-12 rounded-xl',
}

export function ProviderIcon({ provider, size = 'md', className = '' }: ProviderIconProps) {
  const p = PROVIDERS.find((pr) => pr.id === provider)
  if (!p) return null

  if (p.iconUrl) {
    return (
      <div className={`${sizeMap[size]} bg-white/80 backdrop-blur-sm border border-white/50 flex items-center justify-center shadow-sm overflow-hidden shrink-0 ${className}`}>
        <img src={p.iconUrl} alt={p.name} className="h-[60%] w-[60%] object-contain" draggable={false} />
      </div>
    )
  }

  return (
    <div className={`${sizeMap[size]} bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-sm shrink-0 ${className}`}>
      <span className="text-white font-bold text-sm">{p.icon}</span>
    </div>
  )
}
