import { getCredential } from '../../credentials/service'
import { ProviderDeployResult } from '../../../shared/types'
import { runDeployCommand, sanitizeSiteName, validateUploadDir } from '../secure-deploy'

export async function deployToNetlify(
  userId: string,
  uploadDir: string,
  siteName: string
): Promise<ProviderDeployResult> {
  const cred = await getCredential(userId, 'netlify')
  const token = cred?.token || process.env.NETLIFY_AUTH_TOKEN

  if (!token) {
    return { success: false, logs: '', error: 'Netlify token required. Add it in Settings > Credentials.' }
  }

  // Validate and sanitize inputs
  const safeSiteName = sanitizeSiteName(siteName)
  const safeUploadDir = validateUploadDir(uploadDir, process.cwd())

  // Use secure spawn with array arguments - no shell interpolation
  const result = await runDeployCommand('npx', [
    'netlify-cli',
    'deploy',
    '--dir', safeUploadDir,
    '--prod',
    '--site-name', safeSiteName,
  ], {
    cwd: safeUploadDir,
    env: { NETLIFY_AUTH_TOKEN: token },
    timeout: 180000,
  })

  if (!result.success) {
    return result
  }

  const urlMatch = result.logs.match(/https?:\/\/[^\s]+\.netlify\.app/)
  return { success: true, url: urlMatch?.[0], logs: result.logs }
}
