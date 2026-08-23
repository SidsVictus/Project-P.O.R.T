import { getCredential } from '../../credentials/service'
import { ProviderDeployResult } from '../../../shared/types'
import { runDeployCommand, sanitizeSiteName, validateUploadDir, validateNoShellMetacharacters } from '../secure-deploy'

export async function deployToSurge(
  userId: string,
  uploadDir: string,
  siteName: string,
  hostingEmail?: string
): Promise<ProviderDeployResult> {
  const cred = await getCredential(userId, 'surge')
  const token = cred?.token || process.env.SURGE_TOKEN

  // Validate and sanitize inputs
  const safeSiteName = sanitizeSiteName(siteName)
  const safeUploadDir = validateUploadDir(uploadDir, process.cwd())
  
  if (hostingEmail) {
    validateNoShellMetacharacters(hostingEmail, 'hosting email')
  }

  const domain = `${safeSiteName}.surge.sh`

  // Use secure spawn with array arguments - no shell interpolation
  if (token) {
    // Login with token
    const loginResult = await runDeployCommand('npx', [
      'surge', 'login', token,
    ], {
      cwd: safeUploadDir,
      env: { SURGE_LOGIN: token },
      timeout: 60000,
    })
    if (!loginResult.success) {
      return loginResult
    }
  } else if (hostingEmail) {
    // Login with email
    const loginResult = await runDeployCommand('npx', [
      'surge', 'login', '--email', hostingEmail,
    ], {
      cwd: safeUploadDir,
      timeout: 60000,
    })
    if (!loginResult.success) {
      return loginResult
    }
  }

  // Deploy
  const deployArgs = ['surge', safeUploadDir, domain]
  if (token) {
    deployArgs.push('--token', token)
  }
  
  const deployResult = await runDeployCommand('npx', deployArgs, {
    cwd: safeUploadDir,
    env: token ? { SURGE_LOGIN: token } : {},
    timeout: 120000,
  })

  if (!deployResult.success) {
    return deployResult
  }

  const urlMatch = deployResult.logs.match(/https?:\/\/[^\s]+\.surge\.sh/)
  return { success: true, url: urlMatch?.[0] || `https://${domain}`, logs: deployResult.logs }
}
