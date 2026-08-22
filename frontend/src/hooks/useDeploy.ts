import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useDeployStore } from '../stores/deployStore'
import { Provider } from '../../../shared/types'

interface DeployParams {
  siteId: string
  provider: Provider
  siteName: string
  uploadDir: string
  hostingEmail?: string
  scheduledAt?: string
}

export function useDeploy() {
  const { addLog, setDeployResult, setDeploying } = useDeployStore()

  return useMutation({
    mutationFn: async (params: DeployParams) => {
      setDeploying(true)
      addLog(`Deploying ${params.siteName} to ${params.provider}...`)
      const result = await api.post('/api/deploy', params)
      return result
    },
    onSuccess: (data: any) => {
      const url = data?.deployment?.deploy_url || data?.site?.url
      setDeployResult({ url, success: true })
      addLog(`Deployment successful!`)
      setDeploying(false)
    },
    onError: (error: Error) => {
      setDeployResult({ success: false })
      addLog(`Error: ${error.message}`)
      setDeploying(false)
    },
  })
}
