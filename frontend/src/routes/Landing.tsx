import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Globe, Shield, Clock, Webhook, BarChart3, Bell, ArrowRight, Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useAuthStore } from '../stores/authStore'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { ShieldSvg, ClockSvg, BellSvg, GlobeSvg, AnalyticsSvg, WebhookSvg } from '../components/landing/SvgAnimations'

const GITHUB_REPO = 'SidsVictus/Project-P.O.R.T'

function DeployTerminal() {
  const [phase, setPhase] = useState(0)
  const [typed, setTyped] = useState('')

  const cmd = 'npx port deploy my-site --provider netlify'

  useEffect(() => {
    if (phase === 0) {
      let i = 0
      const iv = setInterval(() => {
        i++
        setTyped(cmd.slice(0, i))
        if (i >= cmd.length) { clearInterval(iv); setTimeout(() => setPhase(1), 400) }
      }, 35)
      return () => clearInterval(iv)
    }
  }, [phase])

  const lines = [
    { text: '$ ' + cmd, delay: 0 },
    { text: ' Packaged 14 files (2.3 MB)', delay: 600 },
    { text: ' Uploading to netlify.com...', delay: 1200 },
    { text: ' ✓ Deployed to my-site.netlify.com', delay: 2000, color: 'text-emerald-400' },
  ]

  return (
    <div className="bg-[hsl(220,14%,8%)] rounded-xl p-5 font-mono text-sm leading-relaxed overflow-hidden min-h-[160px]">
      {lines.map((line, i) => (
        <TerminalLine key={i} {...line} phase={phase} />
      ))}
    </div>
  )
}

function TerminalLine({ text, delay, color, phase }: { text: string; delay: number; color?: string; phase: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (phase >= 1) {
      const t = setTimeout(() => setVisible(true), delay)
      return () => clearTimeout(t)
    }
  }, [phase, delay])

  if (!visible) return null
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={color || 'text-gray-300'}
    >
      {text}
    </motion.div>
  )
}

const features: { icon: any; title: string; desc: string; className: string; svg: 'globe' | 'shield' | 'analytics' | 'clock' | 'webhook' | 'bell' }[] = [
  { icon: Globe, title: 'Multi-Provider', desc: 'Deploy to 6+ hosting platforms from one place', className: 'col-span-2 row-span-1', svg: 'globe' },
  { icon: BarChart3, title: 'Analytics', desc: 'Track visits to your deployed sites', className: 'col-span-1 row-span-1', svg: 'analytics' },
  { icon: Shield, title: 'Secure Auth', desc: 'Google OAuth with Supabase', className: 'col-span-1 row-span-2', svg: 'shield' },
  { icon: Clock, title: 'Schedule Deploys', desc: 'Set date and time for auto-deployment', className: 'col-span-1 row-span-1', svg: 'clock' },
  { icon: Webhook, title: 'Git Webhooks', desc: 'Auto-deploy on every GitHub push', className: 'col-span-1 row-span-1', svg: 'webhook' },
  { icon: Bell, title: 'Notifications', desc: 'Email and Slack alerts on deploy status', className: 'col-span-2 row-span-1', svg: 'bell' },
]

export function Landing() {
  const navigate = useNavigate()
  const { user, initialized } = useAuthStore()
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
      .then((r) => r.json())
      .then((data) => setStars(data.stargazers_count))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (initialized && user) navigate('/dashboard', { replace: true })
  }, [initialized, user, navigate])

  return (
    <div className="min-h-screen relative overflow-hidden bg-[hsl(220,25%,95%)]">
      <div className="fixed inset-0 mesh-bg pointer-events-none" />
      <div className="fixed inset-0 bg-pattern" />

      <nav className="fixed top-3 left-3 right-3 z-50 flex items-center justify-between px-8 lg:px-16 py-3 bg-white/15 dark:bg-[hsl(220,14%,11%)]/60 backdrop-blur-xl border border-white/20 dark:border-white/8 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <img src="/bookmark.png" alt="P.O.R.T" className="h-8 w-8" />
          <span className="text-xl font-bold text-brand-red">P.O.R.T</span>
        </div>
        <div className="flex items-center gap-3">
          {stars !== null && (
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-sm border border-white/40 text-sm font-medium text-muted-foreground hover:bg-white/60 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <span>{stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars}</span>
            </a>
          )}
          <ThemeToggle />
          <Button onClick={() => navigate(user ? '/dashboard' : '/login')} variant="outline" className="rounded-full px-6 bg-white/50 backdrop-blur-sm border-white/50 hover:bg-white/80">
            {user ? 'Dashboard' : 'Sign In'} <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
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
            <span className="text-white text-4xl sm:text-5xl md:text-7xl">Everywhere</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
            Your central hub for deploying sites to every major hosting platform. Easy, fast, and completely free.
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
              <span className="ml-2 text-xs text-muted-foreground font-mono">terminal</span>
            </div>
            <DeployTerminal />
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-8 pb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold mb-3 text-brand-red">Everything you need</h2>
        </div>

        <div className="grid sm:grid-cols-3 auto-rows-[200px] gap-4">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.06 }}
              className={`glass glass-hover rounded-2xl p-5 cursor-default group transition-all duration-300 relative overflow-hidden ${f.className}`}
            >
              {f.svg === 'globe' && <GlobeSvg />}
              {f.svg === 'shield' && <ShieldSvg />}
              {f.svg === 'analytics' && <AnalyticsSvg />}
              {f.svg === 'clock' && <ClockSvg />}
              {f.svg === 'webhook' && <WebhookSvg />}
              {f.svg === 'bell' && <BellSvg />}
              <h3 className="font-semibold text-sm relative z-10">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-snug relative z-10 mt-0.5">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/50 py-10 text-center text-sm text-muted-foreground">
        <p className="mb-4">All hosting providers offer free tiers · $0 forever</p>
        <div className="flex items-center justify-center text-xs text-muted-foreground/60">
          <span>&copy; {new Date().getFullYear()} P.O.R.T. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
