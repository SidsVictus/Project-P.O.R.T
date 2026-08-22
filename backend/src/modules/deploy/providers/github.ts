import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { getCredential } from '../../credentials/service'
import { ProviderDeployResult } from '../../../shared/types'

const execAsync = promisify(exec)

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

  const repoName = `port-${siteName}`

  const commands = [
    `git init`,
    `git config user.email "deploy@port.app"`,
    `git config user.name "P.O.R.T"`,
    `git add -A`,
    `git commit -m "Deploy via P.O.R.T"`,
    `git branch -M gh-pages`,
    `git remote add origin https://${token}@github.com/${cred?.email || 'user'}/${repoName}.git`,
    `git push -f origin gh-pages`,
  ].join(' && ')

  try {
    await execAsync(`gh repo create ${repoName} --public --source=. --push`, {
      timeout: 60000,
      cwd: uploadDir,
      env: { ...process.env, GITHUB_TOKEN: token, FORCE_COLOR: '0' },
    }).catch(() => {})

    const { stdout, stderr } = await execAsync(commands, {
      timeout: 120000,
      cwd: uploadDir,
      env: { ...process.env, FORCE_COLOR: '0' },
    })
    const output = stdout + stderr
    const url = `https://${cred?.email?.split('@')[0] || 'user'}.github.io/${repoName}`
    return { success: true, url, logs: output }
  } catch (error: any) {
    return { success: false, logs: error.stdout || '', error: error.message }
  }
}
