import { exec } from 'child_process'
import { promisify } from 'util'
import { getCredential } from '../../credentials/service'
import { ProviderDeployResult } from '../../../shared/types'

const execAsync = promisify(exec)

export async function deployToNetlify(
  userId: string,
  uploadDir: string,
  siteName: string
): Promise<ProviderDeployResult> {
  const cred = await getCredential(userId, 'netlify')
  const token = cred?.token || process.env.NETLIFY_AUTH_TOKEN

  const commands = [
    token ? `NETLIFY_AUTH_TOKEN=${token}` : '',
    `npx netlify-cli deploy --dir=${uploadDir} --prod --site-name=${siteName}`,
  ].filter(Boolean).join(' ')

  try {
    const { stdout, stderr } = await execAsync(commands, { timeout: 180000, env: { ...process.env, FORCE_COLOR: '0' } })
    const output = stdout + stderr
    const urlMatch = output.match(/https?:\/\/[^\s]+\.netlify\.app/)
    return { success: true, url: urlMatch?.[0], logs: output }
  } catch (error: any) {
    return { success: false, logs: error.stdout || '', error: error.message }
  }
}
