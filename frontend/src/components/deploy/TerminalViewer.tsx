import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { useDeployStore } from '../../stores/deployStore'

export function TerminalViewer() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const { deployLogs, showTerminal } = useDeployStore()

  useEffect(() => {
    if (!terminalRef.current || !showTerminal) return
    const term = new Terminal({
      theme: { background: '#0a0a0f', foreground: '#e2e8f0', cursor: '#6366f1' },
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 13,
      rows: 20,
    })
    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(terminalRef.current)
    fit.fit()
    termRef.current = term
    return () => { term.dispose() }
  }, [showTerminal])

  useEffect(() => {
    if (!termRef.current) return
    deployLogs.forEach((log) => termRef.current!.writeln(log))
  }, [deployLogs])

  if (!showTerminal) return null

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-[#0a0a0f]">
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border-b border-border">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-amber-500/80" />
        <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
        <span className="ml-2 text-xs font-mono text-muted-foreground">deployment-output</span>
      </div>
      <div ref={terminalRef} className="p-2 min-h-[200px]" />
    </div>
  )
}
