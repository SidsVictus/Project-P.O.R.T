import { cn, PROVIDERS } from '../../lib/utils'
import { useDeployStore } from '../../stores/deployStore'
import { Provider } from '../../../../shared/types'

export function ProviderSelect() {
  const { provider, setProvider } = useDeployStore()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          onClick={() => setProvider(p.id as Provider)}
          className={cn(
            'flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200',
            provider === p.id
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
            <span className={cn('text-sm font-semibold block', provider === p.id && 'text-primary')}>{p.name}</span>
            <span className="text-[11px] text-muted-foreground">{p.freeTier}</span>
          </div>
          {provider === p.id && (
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Selected</span>
          )}
        </button>
      ))}
    </div>
  )
}
