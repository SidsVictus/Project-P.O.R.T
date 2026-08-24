import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle, Rocket, LayoutDashboard, FileCode, Clock, Webhook,
  BarChart3, Settings, ChevronDown, Globe, Zap, Shield,
  ExternalLink, BookOpen, AlertTriangle, CheckCircle2, Info
} from 'lucide-react'

interface Section {
  id: string
  title: string
  icon: React.ElementType<{className?: string}>,
  content: React.ReactNode
}

const sections: Section[] = [
  {
    id: 'overview',
    title: 'What is P.O.R.T?',
    icon: BookOpen,
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed pl-6">
          <strong>P.O.R.T</strong> is a browser-based deployment hub. It lets you upload your website files,
          pick a hosting provider, and deploy — all from one clean interface. No terminal needed.
        </p>
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 ml-6">
          <p className="text-sm font-medium text-primary flex items-center gap-2">
            <Zap className="h-4 w-4" /> Think of it like this:
          </p>
          <p className="text-sm mt-2 text-muted-foreground">
            Instead of signing into Surge, then Netlify, then Vercel separately to deploy,
            you do it all here. One upload, one click, one place.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed pl-6">
          Your home screen. Shows everything at a glance.
        </p>
        <div className="space-y-3">
          <HelpItem title="Total Sites" text="How many websites you've deployed across all providers." />
          <HelpItem title="Active" text="Sites that are currently live and accessible on the internet." />
          <HelpItem title="Providers" text="How many different hosting platforms you've used (out of 6 supported)." />
          <HelpItem title="Last Deploy" text="When your most recent deployment happened." />
          <HelpItem title="Your Sites List" text="Every site you've deployed. Each row shows the provider, date, live URL, a mini traffic chart, and action buttons (open, redeploy, delete)." />
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
          <p className="text-xs text-amber-700 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Deleting a site from the dashboard only removes the record here. It does NOT take the site offline from the hosting provider.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'deploy',
    title: 'Deploy',
    icon: Rocket,
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed pl-6">
          The core of P.O.R.T. This is where you upload files and push them live.
        </p>
        <div className="space-y-3">
          <HelpItem title="1. Upload Files" text="Drag & drop your project folder or pick files manually. Junk files like temporary and cache folders are automatically filtered out. You can add multiple folders — they stack." />
          <HelpItem title="2. Choose Provider" text="Pick where to host: Surge, Netlify, Vercel, Cloudflare Pages, Firebase, or GitHub Pages." />
          <HelpItem title="3. Configure" text="Set a site name (becomes your URL), optional hosting email, and optionally schedule the deploy for later." />
          <HelpItem title="4. Deploy Now" text="Click the button and watch the live terminal output as your site gets built and deployed." />
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
          <p className="text-xs text-blue-700 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            The "See the backend running" toggle shows live build and deploy logs in real time. It's purely visual — the deploy works either way.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'templates',
    title: 'Templates',
    icon: FileCode,
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed pl-6">
          Save your deployment settings as reusable templates.
        </p>
        <div className="space-y-3">
          <HelpItem title="Create Template" text="Give it a name, pick a provider, and optionally add a hosting email. That's it — saves you from re-entering the same details every time." />
          <HelpItem title="Use Template" text="On the Deploy page, if you have saved templates, a dropdown appears under Configure. Pick one and it auto-selects the provider and fills in the email." />
          <HelpItem title="Delete Template" text="Remove templates you no longer need. Doesn't affect any deployed sites." />
        </div>
      </div>
    ),
  },
  {
    id: 'schedules',
    title: 'Schedules',
    icon: Clock,
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed pl-6">
          Set up deployments to happen automatically at a specific time.
        </p>
        <div className="space-y-3">
          <HelpItem title="Schedule a Deploy" text="When configuring a deploy, set a date/time instead of clicking Deploy Now. The deployment will fire at that time." />
          <HelpItem title="Pending Status" text="Scheduled deploys show as 'pending' until their time arrives. Once executed, they move to 'completed' or 'failed'." />
          <HelpItem title="Cancel" text="You can remove a scheduled deploy before it fires." />
        </div>
        <div className="rounded-xl bg-purple-50 border border-purple-200 p-3">
          <p className="text-xs text-purple-700 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            Schedules run automatically even if your browser is closed, as long as the service is online.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    icon: Webhook,
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed pl-6">
          Get notified when things happen — or trigger external services.
        </p>
        <div className="space-y-3">
          <HelpItem title="Create Webhook" text="Set a URL that P.O.R.T will POST to when a deploy starts, succeeds, or fails." />
          <HelpItem title="Payload" text="Each webhook call includes the deployment status, site name, provider, and timestamp." />
          <HelpItem title="Use Cases" text="Connect to Slack/Discord for notifications, trigger CI/CD pipelines, or log deploys to your own system." />
          <HelpItem title="Delete Webhook" text="Remove a webhook to stop receiving notifications. Doesn't affect past deploys." />
        </div>
      </div>
    ),
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed pl-6">
          Track visitor traffic to your deployed sites.
        </p>
        <div className="space-y-3">
          <HelpItem title="Visits Over Time" text="A line chart showing daily visitor counts. Helps you spot trends and traffic spikes." />
          <HelpItem title="Last 7 Days" text="A bar chart for a quick weekly overview." />
          <HelpItem title="Total Visits" text="Cumulative visitors since you started tracking." />
          <HelpItem title="Unique Visitors" text="Individual visitors (not counting repeat visits)." />
          <HelpItem title="Avg Daily" text="Average visitors per day over the displayed period." />
        </div>
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
          <p className="text-xs text-emerald-700 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            Analytics data appears after a site has been live for a while. Charts need at least 2 data points to render.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed pl-6">
          Manage your account and hosting provider credentials.
        </p>
        <div className="space-y-3">
          <HelpItem title="Profile" text="Your Google account info. Sign in/out from the sidebar." />
          <HelpItem title="Provider Credentials" text="API tokens for hosting providers. P.O.R.T stores these securely so it can deploy on your behalf. You can add, view, and remove credentials here." />
          <HelpItem title="Security" text="Credentials are stored securely and never exposed to the browser." />
        </div>
      </div>
    ),
  },
  {
    id: 'providers',
    title: 'Hosting Providers',
    icon: Globe,
    content: (
      <div className="space-y-5">
        <p className="text-sm leading-relaxed pl-6">
          P.O.R.T supports 6 hosting providers. Here's what each one does and when to use it.
        </p>

        <ProviderGuide
          name="Surge"
          url="surge.sh"
          free="Yes, unlimited"
          bestFor="Quick static sites, prototypes, landing pages"
          howItWorks="Surge is the simplest deployer. No config needed — just push files and get a .surge.sh URL. Custom domains supported."
          pros={['Zero config', 'Instant deploys', 'Free custom domains', 'No build step needed']}
          cons={['Static sites only', 'No server-side code', 'Basic analytics']}
        />

        <ProviderGuide
          name="Netlify"
          url="netlify.com"
          free="Yes, 100GB bandwidth/mo"
          bestFor="JAMstack sites, form handling, serverless functions"
          howItWorks="Netlify builds your site (if needed), serves it on a global CDN, and provides extras like form submissions and identity management."
          pros={['Built-in forms', 'Serverless functions', 'Branch deploys', 'Great DX']}
          cons={['Build limits on free tier', 'Bandwidth caps']}
        />

        <ProviderGuide
          name="Vercel"
          url="vercel.com"
          free="Yes, hobby plan"
          bestFor="Next.js apps, React/Next.js projects, full-stack apps"
          howItWorks="Vercel is made by the creators of Next.js. It auto-detects your framework, builds, and deploys with preview URLs for every push."
          pros={['Best Next.js support', 'Preview deployments', 'Edge functions', 'Analytics built-in']}
          cons={['Framework-focused', 'Free tier has limits']}
        />

        <ProviderGuide
          name="Cloudflare Pages"
          url="pages.cloudflare.com"
          free="Yes, unlimited bandwidth"
          bestFor="Performance-critical sites, global CDN, Workers integration"
          howItWorks="Cloudflare deploys your site to their massive global network. Blazing fast. Can integrate with Cloudflare Workers for serverless logic."
          pros={['Unlimited bandwidth', 'Global edge network', 'Workers integration', 'Free SSL']}
          cons={['Limited build minutes', 'Workers have a learning curve']}
        />

        <ProviderGuide
          name="Firebase Hosting"
          url="firebase.google.com"
          free="Yes, 10GB storage, 10GB/mo transfer"
          bestFor="Google ecosystem users, apps needing backend integration"
          howItWorks="Firebase is Google's app platform. Hosting is one piece — pair it with Firestore, Auth, and Cloud Functions for a full-stack app."
          pros={['Google ecosystem', 'Easy backend integration', 'Instant rolls back', 'Free SSL']}
          cons={['Small free tier', 'Can get expensive fast']}
        />

        <ProviderGuide
          name="GitHub Pages"
          url="pages.github.com"
          free="Yes, 1GB storage, 100GB/mo"
          bestFor="Documentation sites, portfolios, open-source project pages"
          howItWorks="Deploys directly from a GitHub repo. Every push to main can auto-deploy. Great for docs and static sites."
          pros={['Free', 'Auto-deploy from git', 'Custom domains', 'Jekyll support built-in']}
          cons={['Static only', '100GB bandwidth limit', 'No serverless']}
        />
      </div>
    ),
  },
]

function HelpItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="py-2 pl-6 flex gap-2">
      <span className="text-primary mt-0.5 shrink-0">&#8226;</span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{text}</p>
      </div>
    </div>
  )
}

function ProviderGuide({
  name, url, free, bestFor, howItWorks, pros, cons,
}: {
  name: string; url: string; free: string; bestFor: string; howItWorks: string; pros: string[]; cons: string[]
}) {
  return (
    <div className="rounded-xl border border-white/30 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-bold">{name}</h4>
        <a href={`https://${url}`} target="_blank" rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1">
          {url} <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-primary/5 p-2">
          <span className="text-muted-foreground">Free tier:</span> <span className="font-medium">{free}</span>
        </div>
        <div className="rounded-lg bg-primary/5 p-2">
          <span className="text-muted-foreground">Best for:</span> <span className="font-medium">{bestFor}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground pl-4">{howItWorks}</p>
      <div className="grid grid-cols-2 gap-3 pl-4">
        <div>
          <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wide mb-1">Pros</p>
          {pros.map((p, i) => (
            <p key={i} className="text-xs flex items-center gap-1.5 py-0.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" /> {p}
            </p>
          ))}
        </div>
        <div>
          <p className="text-[10px] font-medium text-orange-600 uppercase tracking-wide mb-1">Cons</p>
          {cons.map((c, i) => (
            <p key={i} className="text-xs flex items-center gap-1.5 py-0.5">
              <AlertTriangle className="h-3 w-3 text-orange-500 shrink-0" /> {c}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Help() {
  const [openSection, setOpenSection] = useState<string | null>('overview')

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-brand-red">Help</h1>
        <p className="text-muted-foreground">Everything you need to know about P.O.R.T</p>
      </div>

      <div className="space-y-2">
        {sections.map((section) => (
          <div key={section.id} className="border-b border-white/30 overflow-hidden">
            <button
              onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/20 transition-colors"
            >
              <section.icon className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm font-semibold flex-1">{section.title}</span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  openSection === section.id ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence>
              {openSection === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-5 pb-5 pt-1">
                    {section.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}
