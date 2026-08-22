import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Rocket, Globe, Shield, Zap, Clock, Webhook, BarChart3, Bell, ArrowRight, Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useAuthStore } from '../stores/authStore'
import { ProviderIcon } from '../components/ui/ProviderIcon'
import { PROVIDERS } from '../lib/utils'

const features = [
  { icon: Globe, title: 'Multi-Provider', desc: 'Deploy to 6+ hosting platforms from one place', color: 'from-blue-400 to-blue-600' },
  { icon: Zap, title: 'Instant Deploy', desc: 'One-click deployment in seconds', color: 'from-sky-400 to-cyan-500' },
  { icon: Clock, title: 'Schedule Deploys', desc: 'Set date and time for auto-deployment', color: 'from-indigo-400 to-violet-500' },
  { icon: Webhook, title: 'Git Webhooks', desc: 'Auto-deploy on every GitHub push', color: 'from-blue-500 to-indigo-500' },
  { icon: Shield, title: 'Secure Auth', desc: 'Google OAuth with Supabase', color: 'from-cyan-400 to-teal-500' },
  { icon: BarChart3, title: 'Analytics', desc: 'Track visits to your deployed sites', color: 'from-sky-500 to-blue-500' },
  { icon: Bell, title: 'Notifications', desc: 'Email and Slack alerts on deploy status', color: 'from-blue-400 to-purple-500' },
  { icon: Rocket, title: 'Templates', desc: 'Save and reuse deploy configurations', color: 'from-indigo-500 to-blue-600' },
]

export function Landing() {
  const navigate = useNavigate()
  const { user, initialized } = useAuthStore()

  useEffect(() => {
    if (initialized && user) navigate('/dashboard')
  }, [initialized, user, navigate])

  return (
    <div className="min-h-screen relative overflow-hidden bg-[hsl(220,25%,95%)]">
      <div className="fixed inset-0 bg-pattern" />
      <div className="fixed inset-0 mesh-bg pointer-events-none" />

      <nav className="fixed top-3 left-3 right-3 z-50 flex items-center justify-between px-8 lg:px-16 py-3 bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <img src="/bookmark.png" alt="Journal Deployer" className="h-8 w-8" />
          <span className="text-xl font-bold text-brand-red">Deployer</span>
        </div>
        <Button onClick={() => navigate('/login')} variant="outline" className="rounded-full px-6 bg-white/50 backdrop-blur-sm border-white/50 hover:bg-white/80">
          Sign In <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-8 pt-16 lg:pt-24 pb-28 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 text-sm font-medium text-muted-foreground mb-8 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            Free forever · No credit card required
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight leading-[0.92] mb-6">
            <span className="text-brand-red">Deploy</span>
            <span className="block text-brand-red">Anything</span>
            <span className="text-muted-foreground/50 text-4xl sm:text-5xl md:text-7xl">Everywhere</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
            Your central hub for deploying websites to every major hosting platform. Beautiful, fast, and completely free.
          </p>

          <Button size="lg" onClick={() => navigate('/login')} className="rounded-full px-10 py-6 text-base btn-glow bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-xl shadow-blue-500/20">
            Start Deploying <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} className="mt-20">
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl shadow-blue-500/5">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-3 w-3 rounded-full bg-rose-400/80" />
              <div className="h-3 w-3 rounded-full bg-amber-400/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
              <span className="ml-2 text-xs text-muted-foreground font-mono">journal-deployer</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {(['surge', 'netlify', 'vercel'] as const).map((id) => (
                <div key={id} className="rounded-2xl bg-white/70 p-5 text-center border border-white/50 hover:shadow-lg transition-shadow duration-300">
                  <div className="mx-auto mb-3"><ProviderIcon provider={id} size="lg" /></div>
                  <p className="text-[11px] font-mono text-muted-foreground truncate">my-site.{PROVIDERS.find((p) => p.id === id)?.url}</p>
                  <div className="flex items-center justify-center gap-1 mt-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-emerald-600 font-medium">Live</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-8 pb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold mb-3 text-brand-red">Everything you need</h2>
          <p className="text-muted-foreground text-lg">Powerful features, beautifully simple</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.06 }}
              className="glass glass-hover rounded-2xl p-6 cursor-default group transition-all duration-300"
            >
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <p>Built with love · All hosting providers offer free tiers · $0 forever</p>
      </footer>
    </div>
  )
}
