import fs from 'fs/promises'
import path from 'path'
import { getCredential } from '../../credentials/service'
import { ProviderDeployResult } from '../../../shared/types'
import { runDeployCommand, sanitizeSiteName, validateUploadDir } from '../secure-deploy'

export async function deployToFirebase(
  userId: string,
  uploadDir: string,
  siteName: string
): Promise<ProviderDeployResult> {
  const cred = await getCredential(userId, 'firebase')

  if (!cred?.token) {
    return { success: false, logs: '', error: 'Firebase token required. Add it in Settings > Credentials.' }
  }

  // Validate and sanitize inputs
  const safeSiteName = sanitizeSiteName(siteName)
  const safeUploadDir = validateUploadDir(uploadDir, process.cwd())

  // Write firebase.json securely
  const firebaseJson = {
    hosting: {
      public: '.',
      ignore: ['firebase.json', '**/.*'],
      rewrites: [{ source: '**', destination: '/index.html' }],
    },
  }
  await fs.writeFile(path.join(safeUploadDir, 'firebase.json'), JSON.stringify(firebaseJson, null, 2))

  // Use secure spawn with array arguments - no shell interpolation
  // First login with token via env var
  const loginResult = await runDeployCommand('npx', [
    'firebase-tools',
    'login:ci',
    '--token', cred.token,
  ], {
    cwd: safeUploadDir,
    env: { FIREBASE_TOKEN: cred.token },
    timeout: 60000,
  })

  if (!loginResult.success) {
    return loginResult
  }

  // Then deploy
  const deployResult = await runDeployCommand('npx', [
    'firebase-tools',
    'deploy',
    '--only', 'hosting',
    '-m', 'Deployed via P.O.R.T',
    '--project', safeSiteName,
  ], {
    cwd: safeUploadDir,
    env: { FIREBASE_TOKEN: cred.token, GCLOUD_PROJECT: safeSiteName },
    timeout: 180000,
  })

  if (!deployResult.success) {
    return deployResult
  }

  const urlMatch = deployResult.logs.match(/https?:\/\/[^\s]+\.web\.app/)
  return { success: true, url: urlMatch?.[0], logs: deployResult.logs }
}
