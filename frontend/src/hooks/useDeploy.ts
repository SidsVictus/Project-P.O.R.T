import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useDeployStore } from '../stores/deployStore'
import { Provider } from '../../../shared/types'

interface DeployParams {
  provider: Provider
  siteName: string
  uploadDir: string
  hostingEmail?: string
  scheduledAt?: string
}

export function useDeploy() {
  const { addLog, setCurrentDeploymentId, setDeploying } = useDeployStore()

  return useMutation({
    mutationFn: async (params: DeployParams) => {
      setDeploying(true)
      addLog(`Deploying ${params.siteName} to ${params.provider}...`)
      const result = await api.post('/api/deploy', params)
      return result
    },
    onSuccess: (data: any) => {
      const deploymentId = data?.deployment?.id
      if (deploymentId) {
        setCurrentDeploymentId(deploymentId)
      }
    },
    onError: (error: Error) => {
      useDeployStore.getState().setDeployResult({ success: false })
      addLog(`Error: ${error.message}`)
      setDeploying(false)
    },
  })
}
