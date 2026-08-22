import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { getCredential } from '../../credentials/service'
import { ProviderDeployResult } from '../../../shared/types'

const execAsync = promisify(exec)

export async function deployToFirebase(
  userId: string,
  uploadDir: string,
  siteName: string
): Promise<ProviderDeployResult> {
  const cred = await getCredential(userId, 'firebase')

  const firebaseJson = {
    hosting: {
      public: '.',
      ignore: ['firebase.json', '**/.*'],
      rewrites: [{ source: '**', destination: '/index.html' }],
    },
  }
  await fs.writeFile(path.join(uploadDir, 'firebase.json'), JSON.stringify(firebaseJson, null, 2))

  const commands = [
    cred?.token ? `npx firebase-tools login:ci --token ${cred.token}` : 'npx firebase-tools login',
    `npx firebase-tools deploy --only hosting -m "Deployed via Journal Deployer"`,
  ].join(' && ')

  try {
    const { stdout, stderr } = await execAsync(commands, {
      timeout: 180000,
      env: { ...process.env, FORCE_COLOR: '0', GCLOUD_PROJECT: siteName },
      cwd: uploadDir,
    })
    const output = stdout + stderr
    const urlMatch = output.match(/https?:\/\/[^\s]+\.web\.app/)
    return { success: true, url: urlMatch?.[0], logs: output }
  } catch (error: any) {
    return { success: false, logs: error.stdout || '', error: error.message }
  }
}
