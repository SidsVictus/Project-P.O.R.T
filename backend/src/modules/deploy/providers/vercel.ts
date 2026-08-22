import { exec } from 'child_process'
import { promisify } from 'util'
import { getCredential } from '../../credentials/service'
import { ProviderDeployResult } from '../../../shared/types'

const execAsync = promisify(exec)

export async function deployToVercel(
  userId: string,
  uploadDir: string
): Promise<ProviderDeployResult> {
  const cred = await getCredential(userId, 'vercel')
  const token = cred?.token || process.env.VERCEL_TOKEN

  const commands = [
    `npx vercel --prod --yes --token ${token} ${uploadDir}`,
  ].join(' ')

  try {
    const { stdout, stderr } = await execAsync(commands, { timeout: 180000, env: { ...process.env, FORCE_COLOR: '0' } })
    const output = stdout + stderr
    const urlMatch = output.match(/https?:\/\/[^\s]+\.vercel\.app/)
    return { success: true, url: urlMatch?.[0], logs: output }
  } catch (error: any) {
    return { success: false, logs: error.stdout || '', error: error.message }
  }
}
