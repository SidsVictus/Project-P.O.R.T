import { useState, useRef } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'
import { Bell, Rocket, AlertTriangle, RefreshCw, Bug } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeToggle } from '../ui/ThemeToggle'

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

export function Header() {
  const { user, customAvatar, setCustomAvatar } = useAuthStore()
  const { sidebarOpen } = useUIStore()
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/api/notifications'),
    refetchInterval: 30000,
  })

  const allItems = (notifications as any[]) || []
  const items = expanded ? allItems : allItems.slice(0, 5)
  const unread = allItems.length

  return (
    <header
      className="fixed top-3 right-3 z-30 h-14 bg-white/25 dark:bg-[hsl(220,14%,11%)]/80 backdrop-blur-xl border border-white/20 dark:border-white/8 rounded-2xl shadow-sm flex items-center justify-between px-6 transition-all duration-300"
      style={{ left: sidebarOpen ? '260px' : '106px' }}
    >
      <div />
      <div className="flex items-center gap-4 relative">
        <ThemeToggle className="!bg-white/20 dark:!bg-white/5 !border-white/20 dark:!border-white/10" />
        <div className="relative">
          <button onClick={() => { setOpen(!open); setExpanded(false) }} className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            )}
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-white dark:bg-[hsl(220,14%,11%)] shadow-xl border border-border/50 overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <span className="text-sm font-semibold">Notifications</span>
                  {allItems.length > 5 && (
                    <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary hover:underline">
                      {expanded ? 'Show less' : 'View all'}
                    </button>
                  )}
                </div>
                {items.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                  <div className={expanded ? 'max-h-96 overflow-y-auto' : ''}>
                    {items.map((n: any) => {
                      const Icon = ICONS[n.type] || Bell
                      return (
                        <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border/30 last:border-0">
                          <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${COLORS[n.type] || 'text-muted-foreground'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{n.title}</p>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {new Date(n.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative cursor-pointer group">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => setCustomAvatar(reader.result as string)
                reader.readAsDataURL(file)
              }}
            />
            {customAvatar || user?.avatar_url ? (
              <img
                src={customAvatar || user?.avatar_url}
                alt="avatar"
                className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/30 transition-all"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 text-[9px] text-white font-medium">
              Edit
            </span>
          </label>
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
        </div>
      </div>
    </header>
  )
}
