import { Provider, ProviderDeployResult } from '../../../shared/types'
import { deployToSurge } from './surge'
import { deployToNetlify } from './netlify'
import { deployToVercel } from './vercel'
import { deployToCloudflare } from './cloudflare'
import { deployToFirebase } from './firebase'
import { deployToGitHubPages } from './github'

export type DeployFunction = (
  userId: string,
  uploadDir: string,
  siteName: string,
  hostingEmail?: string
) => Promise<ProviderDeployResult>

const providers: Record<string, DeployFunction> = {
  surge: deployToSurge,
  netlify: deployToNetlify,
  vercel: deployToVercel,
  cloudflare: deployToCloudflare,
  firebase: deployToFirebase,
  github: deployToGitHubPages,
}

export function getDeployFunction(provider: Provider): DeployFunction | null {
  return providers[provider] || null
}

export { deployToSurge, deployToNetlify, deployToVercel, deployToCloudflare, deployToFirebase, deployToGitHubPages }
