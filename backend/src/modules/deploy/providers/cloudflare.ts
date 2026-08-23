import { getCredential } from '../../credentials/service'
import { ProviderDeployResult } from '../../../shared/types'
import { runDeployCommand, sanitizeSiteName, validateUploadDir } from '../secure-deploy'

export async function deployToCloudflare(
  userId: string,
  uploadDir: string,
  siteName: string
): Promise<ProviderDeployResult> {
  const cred = await getCredential(userId, 'cloudflare')
  const token = cred?.token || process.env.CLOUDFLARE_API_TOKEN

  if (!token) {
    return { success: false, logs: '', error: 'Cloudflare token required. Add it in Settings > Credentials.' }
  }

  // Validate and sanitize inputs
  const safeSiteName = sanitizeSiteName(siteName)
  const safeUploadDir = validateUploadDir(uploadDir, process.cwd())

  // Use secure spawn with array arguments - no shell interpolation
  const result = await runDeployCommand('npx', [
    'wrangler',
    'pages',
    'deploy',
    safeUploadDir,
    '--project-name', safeSiteName,
  ], {
    cwd: safeUploadDir,
    env: { CLOUDFLARE_API_TOKEN: token },
    timeout: 180000,
  })

  if (!result.success) {
    return result
  }

  const urlMatch = result.logs.match(/https?:\/\/[^\s]+\.pages\.dev/)
  return { success: true, url: urlMatch?.[0], logs: result.logs }
}
