import { getCredential } from '../../credentials/service'
import { ProviderDeployResult } from '../../../shared/types'
import { runDeployCommand, sanitizeSiteName, validateUploadDir } from '../secure-deploy'

export async function deployToVercel(
  userId: string,
  uploadDir: string,
  siteName: string
): Promise<ProviderDeployResult> {
  const cred = await getCredential(userId, 'vercel')
  const token = cred?.token || process.env.VERCEL_TOKEN

  if (!token) {
    return { success: false, logs: '', error: 'Vercel token required. Add it in Settings > Credentials.' }
  }

  // Validate and sanitize inputs
  const safeSiteName = sanitizeSiteName(siteName)
  const safeUploadDir = validateUploadDir(uploadDir, process.cwd())

  // Use secure spawn with array arguments - no shell interpolation
  const result = await runDeployCommand('npx', [
    'vercel',
    '--prod',
    '--yes',
    '--token', token,
    safeUploadDir,
    '--name', safeSiteName,
  ], {
    cwd: safeUploadDir,
    env: { VERCEL_TOKEN: token },
    timeout: 180000,
  })

  if (!result.success) {
    return result
  }

  const urlMatch = result.logs.match(/https?:\/\/[^\s]+\.vercel\.app/)
  return { success: true, url: urlMatch?.[0], logs: result.logs }
}
