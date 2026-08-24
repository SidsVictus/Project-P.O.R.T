import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

function getIsDark(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem('theme')
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState(getIsDark)

  useEffect(() => {
    applyTheme(dark)
  }, [dark])

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className={`p-2 rounded-full bg-white/40 backdrop-blur-sm border border-white/40 hover:bg-white/60 transition-colors ${className}`}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? (
        <Sun className="h-4 w-4 text-yellow-400" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  )
}
