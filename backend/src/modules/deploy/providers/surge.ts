import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'
import { getCredential } from '../../credentials/service'
import { ProviderDeployResult } from '../../../shared/types'

const execAsync = promisify(exec)

export async function deployToSurge(
  userId: string,
  uploadDir: string,
  siteName: string,
  hostingEmail?: string
): Promise<ProviderDeployResult> {
  const cred = await getCredential(userId, 'surge')
  const token = cred?.token || process.env.SURGE_TOKEN

  const domain = `${siteName}.surge.sh`
  const loginCmd = token
    ? `npx surge login ${token}`
    : hostingEmail
      ? `npx surge login --email ${hostingEmail}`
      : ''

  const commands = [
    loginCmd,
    `npx surge ${uploadDir} ${domain} --token ${token || ''}`,
  ].filter(Boolean).join(' && ')

  try {
    const { stdout, stderr } = await execAsync(commands, { timeout: 120000, env: { ...process.env, FORCE_COLOR: '0' } })
    const output = stdout + stderr
    const urlMatch = output.match(/https?:\/\/[^\s]+\.surge\.sh/)
    return { success: true, url: urlMatch?.[0] || `https://${domain}`, logs: output }
  } catch (error: any) {
    return { success: false, logs: error.stdout || '', error: error.message }
  }
}
