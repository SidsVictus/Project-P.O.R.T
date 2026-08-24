import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Rocket, Clock, FileCode, Settings, Webhook, BarChart3, HelpCircle, ChevronLeft, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useUIStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/deploy', icon: Rocket, label: 'Deploy' },
  { to: '/templates', icon: FileCode, label: 'Templates' },
  { to: '/schedules', icon: Clock, label: 'Schedules' },
  { to: '/webhooks', icon: Webhook, label: 'Webhooks' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/help', icon: HelpCircle, label: 'Help' },
]

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { signOut } = useAuthStore()

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 h-screen border-r border-white/30 dark:border-white/10 bg-white/30 dark:bg-[hsl(225,20%,10%)]/70 backdrop-blur-xl transition-all duration-300 flex flex-col',
      sidebarOpen ? 'w-64' : 'w-[100px]'
    )}>
      <div className="flex items-center justify-between p-4 h-16">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <img src="/bookmark.png" alt="" className="h-7 w-7" />
            <span className="text-lg font-bold text-brand-red">P.O.R.T</span>
          </div>
        )}
        {!sidebarOpen && (
          <img src="/bookmark.png" alt="P.O.R.T" className="h-7 w-7 mx-auto" />
        )}
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ChevronLeft className={cn('h-5 w-5 transition-transform', !sidebarOpen && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200',
              sidebarOpen ? 'px-3 py-2.5' : 'px-2 py-2',
              isActive ? 'bg-primary/10 text-primary border-l-2 border-primary font-semibold' : 'text-muted-foreground hover:bg-white/40 hover:text-foreground border-l-2 border-transparent'
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
