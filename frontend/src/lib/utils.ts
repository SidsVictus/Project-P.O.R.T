import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(date: string) {
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const PROVIDERS = [
  { id: 'surge', name: 'Surge', color: '#88e8b5', icon: 'S', iconUrl: '/providers/surge.png', freeTier: 'Unlimited projects', url: 'surge.sh' },
  { id: 'netlify', name: 'Netlify', color: '#00c7b7', icon: 'N', iconUrl: '/providers/netlify.png', freeTier: '100GB bandwidth', url: 'netlify.com' },
  { id: 'vercel', name: 'Vercel', color: '#000', icon: 'V', iconUrl: '/providers/vercel.png', freeTier: '100GB bandwidth', url: 'vercel.com' },
  { id: 'cloudflare', name: 'Cloudflare', color: '#f48120', icon: 'C', iconUrl: '/providers/cloudflare.png', freeTier: 'Unlimited bandwidth', url: 'cloudflare.com' },
  { id: 'firebase', name: 'Firebase', color: '#ffca28', icon: 'F', iconUrl: '/providers/firebase.png', freeTier: '10GB storage', url: 'firebase.google.com' },
  { id: 'github', name: 'GitHub Pages', color: '#333', icon: 'G', iconUrl: '/providers/github.png', freeTier: 'Unlimited', url: 'pages.github.com' },
  { id: 'custom', name: 'Custom CLI', color: '#a78bfa', icon: '+', iconUrl: '', freeTier: 'Varies', url: '' },
] as const

export const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-400',
  success: 'text-emerald-400',
  failed: 'text-red-400',
  pending: 'text-amber-400',
  building: 'text-blue-400',
  deploying: 'text-purple-400',
  uploading: 'text-cyan-400',
}
