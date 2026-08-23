import fs from 'fs/promises'
import path from 'path'
import { getCredential } from '../../credentials/service'
import { ProviderDeployResult } from '../../../shared/types'
import { runDeployCommand, sanitizeSiteName, validateUploadDir, validateNoShellMetacharacters } from '../secure-deploy'

export async function deployToGitHubPages(
  userId: string,
  uploadDir: string,
  siteName: string
): Promise<ProviderDeployResult> {
  const cred = await getCredential(userId, 'github')
  const token = cred?.token || process.env.GITHUB_TOKEN

  if (!token) {
    return { success: false, logs: '', error: 'GitHub token required. Add it in Settings > Credentials.' }
  }

  // Validate and sanitize inputs
  const safeSiteName = sanitizeSiteName(siteName)
  const safeUploadDir = validateUploadDir(uploadDir, process.cwd())
  
  // Validate email doesn't contain shell metacharacters
  if (cred?.email) {
    validateNoShellMetacharacters(cred.email, 'GitHub email')
  }

  const repoName = `port-${safeSiteName}`
  const githubUser = cred?.email?.split('@')[0] || 'user'

  // Use secure spawn with array arguments - no shell interpolation
  // First create repo
  const createResult = await runDeployCommand('gh', [
    'repo', 'create', repoName,
    '--public',
    '--source=.',
    '--push',
  ], {
    cwd: safeUploadDir,
    env: { GITHUB_TOKEN: token, FORCE_COLOR: '0' },
    timeout: 60000,
  })

  // Ignore create failure (repo might exist)

  // Initialize git and push
  const commands = [
    ['git', 'init'],
    ['git', 'config', 'user.email', 'deploy@port.app'],
    ['git', 'config', 'user.name', 'P.O.R.T'],
    ['git', 'add', '-A'],
    ['git', 'commit', '-m', 'Deploy via P.O.R.T'],
    ['git', 'branch', '-M', 'gh-pages'],
    ['git', 'remote', 'add', 'origin', `https://${token}@github.com/${githubUser}/${repoName}.git`],
    ['git', 'push', '-f', 'origin', 'gh-pages'],
  ]

  let allOutput = ''
  for (const [cmd, ...args] of commands) {
    const result = await runDeployCommand(cmd, args, {
      cwd: safeUploadDir,
      env: { FORCE_COLOR: '0' },
      timeout: 120000,
    })
    allOutput += result.logs
    if (!result.success) {
      return { success: false, logs: allOutput, error: result.error }
    }
  }

  const url = `https://${githubUser}.github.io/${repoName}`
  return { success: true, url, logs: allOutput }
}
