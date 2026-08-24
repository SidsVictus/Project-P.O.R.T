import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useUIStore } from '../../stores/uiStore'
import { useAuth } from '../../hooks/useAuth'
import { Outlet } from 'react-router-dom'

export function Layout() {
  useAuth(true)
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-screen relative overflow-hidden bg-[hsl(220,25%,95%)] dark:bg-[hsl(220,14%,18%)]">
      <div className="fixed inset-0 mesh-bg pointer-events-none" />
      <div className="fixed inset-0 bg-pattern" />
      <Sidebar />
      <Header />
      <main
        className="pt-24 transition-all duration-300 relative z-10"
        style={{ marginLeft: sidebarOpen ? '256px' : '100px' }}
      >
        <div className="pl-4 pr-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
