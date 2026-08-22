import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { PartyPopper as PartyPopperIcon } from 'lucide-react'
import { useDeployStore } from '../../stores/deployStore'
import { Button } from '../ui/button'

export function PartyPopper() {
  const { deployResult, reset } = useDeployStore()

  useEffect(() => {
    if (deployResult?.success) {
      const end = Date.now() + 3000
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#6366f1', '#8b5cf6', '#06b6d4'] })
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#6366f1', '#8b5cf6', '#06b6d4'] })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    }
  }, [deployResult])

  if (!deployResult?.success) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-2xl p-8 max-w-md w-full mx-4 text-center space-y-6 animate-fade-in">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto glow">
          <PartyPopperIcon className="h-10 w-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold gradient-text">Deployment Successful!</h2>
          <p className="text-muted-foreground mt-2">Your site is now live</p>
        </div>
        {deployResult.url && (
          <a
            href={deployResult.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-primary hover:underline font-mono text-sm bg-primary/10 px-4 py-2 rounded-lg"
          >
            {deployResult.url}
          </a>
        )}
        <Button onClick={reset} className="w-full">Deploy Another Site</Button>
      </div>
    </div>
  )
}
