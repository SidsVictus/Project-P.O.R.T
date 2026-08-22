import { supabaseAdmin } from '../../config/database'
import { logger } from '../../shared/logger'
import { DeployStatus, Provider } from '../../shared/types'
import { getDeployFunction } from './providers'
import { cleanupUploadDir } from '../upload/service'
import { sendNotification } from '../notifications/service'

const TABLE = 'deployments'
const SITES_TABLE = 'sites'

export async function executeDeploy(
  deploymentId: string,
  userId: string,
  siteId: string,
  provider: Provider,
  siteName: string,
  uploadDir: string,
  hostingEmail?: string,
  emitLog?: (msg: string) => void
): Promise<void> {
  const updateStatus = async (status: DeployStatus, url?: string, logs?: string, error?: string) => {
    await supabaseAdmin.from(TABLE).update({
      status,
      deploy_url: url || null,
      logs: logs || '',
      completed_at: status === 'success' || status === 'failed' ? new Date().toISOString() : null,
    }).eq('id', deploymentId)
  }

  try {
    await updateStatus('deploying')
    emitLog?.(`Starting deployment to ${provider}...`)

    const deployFn = getDeployFunction(provider)
    if (!deployFn) {
      throw new Error(`Unsupported provider: ${provider}`)
    }

    const result = await deployFn(userId, uploadDir, siteName, hostingEmail)

    if (result.success) {
      await updateStatus('success', result.url, result.logs)
      await supabaseAdmin.from(SITES_TABLE).update({
        url: result.url,
        status: 'active',
        updated_at: new Date().toISOString(),
      }).eq('id', siteId)

      emitLog?.(`Deployment successful! URL: ${result.url}`)
      await sendNotification(userId, 'success', siteName, result.url)
    } else {
      await updateStatus('failed', undefined, result.logs, result.error)
      emitLog?.(`Deployment failed: ${result.error}`)
      await sendNotification(userId, 'failed', siteName, undefined, result.error)
    }
  } catch (error: any) {
    logger.error({ error, deploymentId }, 'Deployment failed')
    await updateStatus('failed', undefined, '', error.message)
    emitLog?.(`Error: ${error.message}`)
    await sendNotification(userId, 'failed', siteName, undefined, error.message)
  } finally {
    await cleanupUploadDir(uploadDir)
  }
}
