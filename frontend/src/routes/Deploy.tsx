import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { DropZone } from '../components/deploy/DropZone'
import { ProviderSelect } from '../components/deploy/ProviderSelect'
import { DeployConfig } from '../components/deploy/DeployConfig'
import { TerminalViewer } from '../components/deploy/TerminalViewer'
import { PartyPopper } from '../components/deploy/PartyPopper'
import { useDeployStore } from '../stores/deployStore'
import { useDeploy } from '../hooks/useDeploy'
import { useWebSocket } from '../hooks/useWebSocket'
import toast from 'react-hot-toast'

export function Deploy() {
  const navigate = useNavigate()
  const { uploadDir, siteName, hostingEmail, scheduledAt, deployResult, deploying, currentDeploymentId } = useDeployStore()
  const deployMutation = useDeploy()

  useWebSocket(currentDeploymentId || undefined)

  const handleDeploy = async () => {
    if (!uploadDir) return toast.error('Upload files first')
    if (!siteName.trim()) return toast.error('Enter a site name')

    try {
      await deployMutation.mutateAsync({
        provider: useDeployStore.getState().provider,
        siteName,
        uploadDir,
        hostingEmail: hostingEmail || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      })
    } catch (err: any) {
      toast.error(err.message || 'Deployment failed')
    }
  }

  if (deployResult) return <PartyPopper />

  return (
    <div className="max-w-3xl space-y-10">
      <div>
          <h1 className="text-4xl font-bold text-brand-red">Deploy</h1>
        <p className="text-muted-foreground">Upload files and deploy to any provider</p>
      </div>

      <div className="pl-6">
        <h2 className="text-lg font-semibold mb-3">1. Upload Files</h2>
        <DropZone />
      </div>

      <div className="pl-6">
        <h2 className="text-lg font-semibold mb-3">2. Choose Provider</h2>
        <ProviderSelect />
      </div>

      <div className="pl-6">
        <h2 className="text-lg font-semibold mb-3">3. Configure</h2>
        <DeployConfig />
      </div>

      <div className="pl-6">
        <TerminalViewer />
      </div>

      <div className="pl-6 flex gap-4">
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">Cancel</Button>
        <Button
          onClick={handleDeploy}
          disabled={!uploadDir || !siteName.trim() || deploying}
          className="flex-1 glow text-lg py-6"
        >
          {deploying ? 'Deploying...' : scheduledAt ? 'Schedule Deploy' : 'Deploy Now'}
        </Button>
      </div>
    </div>
  )
}
