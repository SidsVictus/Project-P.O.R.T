import { FolderOpen } from 'lucide-react'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'

export function EmptyState() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 animate-pulse-slow">
        <FolderOpen className="h-10 w-10 text-primary/50" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No sites deployed yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Upload your project files and deploy them to any hosting provider with one click
      </p>
      <Button onClick={() => navigate('/deploy')} className="glow">
        Deploy Your First Site
      </Button>
    </div>
  )
}
