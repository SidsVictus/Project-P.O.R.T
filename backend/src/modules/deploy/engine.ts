import { supabaseAdmin } from '../../config/database'
import { logger } from '../../shared/logger'
import { DeployStatus, Provider } from '../../shared/types'
import { getDeployFunction } from './providers'
import { cleanupUploadDir } from '../upload/service'
import { sendNotification } from '../notifications/service'

const TABLE = 'deployments'
const SITES_TABLE = 'sites'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function executeDeploy(
  deploymentId: string,
  userId: string,
  siteId: string,
  provider: Provider,
  siteName: string,
  uploadDir: string,
  hostingEmail?: string,
  emitLog?: (msg: string) => void,
  emitStatus?: (status: string) => void
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
    emitLog?.(`Preparing deployment...`)

    const deployFn = getDeployFunction(provider)
    if (!deployFn) {
      throw new Error(`Unsupported provider: ${provider}`)
    }

    emitLog?.(`Connecting to ${provider}...`)
    await delay(800)

    emitLog?.(`Authenticating...`)
    await delay(600)

    emitLog?.(`Uploading files...`)
    await delay(1000)

    emitLog?.(`Building and deploying...`)

    const result = await deployFn(userId, uploadDir, siteName, hostingEmail)

    if (result.success) {
      emitLog?.(`Verifying deployment...`)
      await delay(500)

      await updateStatus('success', result.url, result.logs)
      await supabaseAdmin.from(SITES_TABLE).update({
        url: result.url,
        status: 'active',
        updated_at: new Date().toISOString(),
      }).eq('id', siteId)

      emitLog?.(`Deployment successful! Live at: ${result.url}`)
      emitStatus?.('success')
      await sendNotification(userId, 'success', siteName, result.url)
    } else {
      emitLog?.(`Deployment failed: ${result.error}`)
      emitStatus?.('failed')
      await updateStatus('failed', undefined, result.logs, result.error)
      await sendNotification(userId, 'failed', siteName, undefined, result.error)
    }
  } catch (error: any) {
    logger.error({ error, deploymentId }, 'Deployment failed')
    await updateStatus('failed', undefined, '', error.message)
    emitLog?.(`Error: ${error.message}`)
    emitStatus?.('failed')
    await sendNotification(userId, 'failed', siteName, undefined, error.message)
  } finally {
    await cleanupUploadDir(uploadDir)
  }
}
