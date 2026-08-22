import { useEffect } from 'react'
import { getSocket } from '../lib/socket'
import { useAuthStore } from '../stores/authStore'
import { useDeployStore } from '../stores/deployStore'

export function useWebSocket(deploymentId?: string) {
  const user = useAuthStore((s) => s.user)
  const addLog = useDeployStore((s) => s.addLog)

  useEffect(() => {
    if (!user?.id || !deploymentId) return

    const socket = getSocket(user.id)

    socket.on('deploy:log', (data: { deploymentId: string; message: string }) => {
      if (data.deploymentId === deploymentId) {
        addLog(data.message)
      }
    })

    return () => {
      socket.off('deploy:log')
    }
  }, [user?.id, deploymentId, addLog])
}
