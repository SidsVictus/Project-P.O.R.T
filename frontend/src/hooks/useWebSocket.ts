import { useEffect } from 'react'
import { getSocket } from '../lib/socket'
import { useAuthStore } from '../stores/authStore'
import { useDeployStore } from '../stores/deployStore'

export function useWebSocket(deploymentId?: string) {
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user?.id || !deploymentId) return

    const socket = getSocket(user.id)

    socket.on('deploy:log', (data: { deploymentId: string; message: string }) => {
      if (data.deploymentId === deploymentId) {
        useDeployStore.getState().addLog(data.message)
      }
    })

    socket.on('deploy:status', (data: { deploymentId: string; status: string }) => {
      if (data.deploymentId === deploymentId) {
        const store = useDeployStore.getState()
        if (data.status === 'success') {
          const lastLog = store.deployLogs[store.deployLogs.length - 1] || ''
          const urlMatch = lastLog.match(/https?:\/\/\S+/)
          const url = urlMatch?.[0]
          setTimeout(() => {
            store.setDeployResult({ url, success: true })
            store.setDeploying(false)
          }, 6000)
        } else if (data.status === 'failed') {
          store.setDeployResult({ success: false })
          store.setDeploying(false)
        }
      }
    })

    return () => {
      socket.off('deploy:log')
      socket.off('deploy:status')
    }
  }, [user?.id, deploymentId])
}
