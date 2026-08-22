import { exec } from 'child_process'
import { promisify } from 'util'
import { getCredential } from '../../credentials/service'
import { ProviderDeployResult } from '../../../shared/types'

const execAsync = promisify(exec)

export async function deployToCloudflare(
  userId: string,
  uploadDir: string,
  siteName: string
): Promise<ProviderDeployResult> {
  const cred = await getCredential(userId, 'cloudflare')
  const token = cred?.token || process.env.CLOUDFLARE_API_TOKEN

  const commands = [
    token ? `CLOUDFLARE_API_TOKEN=${token}` : '',
    `npx wrangler pages deploy ${uploadDir} --project-name=${siteName}`,
  ].filter(Boolean).join(' ')

  try {
    const { stdout, stderr } = await execAsync(commands, { timeout: 180000, env: { ...process.env, FORCE_COLOR: '0' } })
    const output = stdout + stderr
    const urlMatch = output.match(/https?:\/\/[^\s]+\.pages\.dev/)
    return { success: true, url: urlMatch?.[0], logs: output }
  } catch (error: any) {
    return { success: false, logs: error.stdout || '', error: error.message }
  }
}
